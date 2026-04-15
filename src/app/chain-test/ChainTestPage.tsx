import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConfigProvider, Input, Button, message } from 'antd';
import { CheckCircle2, AlertCircle, Copy, ExternalLink, Wallet, FileSignature, Link2, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getChainSignature, submitChainData, type ChainSignatureResponse, type ChainSubmitResult } from '@/lib/api';
import {
  getWalletSigner,
  getCFRegistryContract,
  getERC20Contract,
  encodeSampleData,
  computeContentHash,
  CF_REGISTRY_ADDRESS,
  BSC_EXPLORER_URL,
  BSC_CHAIN_ID,
} from '@/lib/contracts';

/* ── tiny helpers ──────────────────────────────────────────────────────────── */
function shorten(s: string, len = 16) {
  if (!s || s.length <= len) return s;
  return `${s.slice(0, len / 2 + 2)}...${s.slice(-(len / 2 - 2))}`;
}
function copyText(text: string) {
  navigator.clipboard.writeText(text);
  message.success('Copied');
}

/* ── result display ────────────────────────────────────────────────────────── */
function JsonBlock({ data }: { data: unknown }) {
  const text = JSON.stringify(data, null, 2);
  return (
    <div className="relative">
      <button onClick={() => copyText(text)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 hover:bg-white transition-colors">
        <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
      </button>
      <pre className="bg-[#1E1E2E] text-[#A6E3A1] text-xs p-4 rounded-xl overflow-x-auto max-h-64 leading-relaxed font-mono">{text}</pre>
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-flex items-center gap-1 text-xs font-bold text-[#22C55E]"><CheckCircle2 className="w-3.5 h-3.5" /> Success</span>
    : <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
}

/* ── main page ─────────────────────────────────────────────────────────────── */
export default function ChainTestPage() {
  const { walletAddress, userInfo, isLoggedIn } = useApp();

  // ── shared inputs ──
  const [submissionId, setSubmissionId] = useState('');
  const [userDid, setUserDid] = useState('');
  const [address, setAddress] = useState('');

  // ── Step 2 inputs (declared early so auto-fill can reference them) ──
  const [foodImageUrl, setFoodImageUrl] = useState('');
  const [frontierId, setFrontierId] = useState('');
  const [contributorDidId, setContributorDidId] = useState('');

  // ── last submission record from TaskPage ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastSubmission, setLastSubmission] = useState<Record<string, any> | null>(null);

  // Auto-fill on mount: user context + last submission from sessionStorage
  useEffect(() => {
    // fill user info
    if (walletAddress) setAddress(walletAddress);
    if (userInfo?.user_data?.did) setUserDid(userInfo.user_data.did);
    if (userInfo?.user_data?.user_id) setContributorDidId(userInfo.user_data.user_id);

    // load last submission
    try {
      const raw = sessionStorage.getItem('codatta_last_submission');
      if (raw) {
        const data = JSON.parse(raw);
        setLastSubmission(data);
        if (data.submission_id) setSubmissionId(data.submission_id);
        if (data.food_image) setFoodImageUrl(data.food_image);
        if (data.frontier_id) setFrontierId(data.frontier_id);
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, userInfo]);

  /* ═══════════════ Step 1: Get Chain Signature ═══════════════ */
  const [sig1Loading, setSig1Loading] = useState(false);
  const [sig1Result, setSig1Result] = useState<ChainSignatureResponse | null>(null);
  const [sig1Error, setSig1Error] = useState('');

  const runStep1 = async () => {
    if (!submissionId || !userDid) { message.warning('submission_id and user_did are required'); return; }
    setSig1Loading(true); setSig1Error(''); setSig1Result(null);
    try {
      const res = await getChainSignature({ submissionId, userDid });
      setSig1Result(res);
      message.success('Signature obtained');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setSig1Error(msg);
      message.error(msg);
    } finally { setSig1Loading(false); }
  };

  /* ═══════════════ Step 2: Contract Call ═══════════════ */
  // allow manual override of signature fields
  const [manualCfId, setManualCfId] = useState('');
  const [manualValidatorDidId, setManualValidatorDidId] = useState('');
  const [manualGrade, setManualGrade] = useState('');
  const [manualSignature, setManualSignature] = useState('');

  const [txLoading, setTxLoading] = useState(false);
  const [txResult, setTxResult] = useState<{ hash: string; blockNumber: number; cfId: string } | null>(null);
  const [txError, setTxError] = useState('');

  // Wallet info
  const [walletInfo, setWalletInfo] = useState<{ address: string; chainId: number; balance: string; feeToken: string; feeSymbol: string; anchorFee: string; allowance: string } | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const readWalletInfo = async () => {
    setWalletLoading(true);
    try {
      const { signer } = await getWalletSigner();
      const signerAddr = await signer.getAddress();
      const provider = signer.provider!;
      const network = await provider.getNetwork();
      const balance = ethers.formatEther(await provider.getBalance(signerAddr));

      const cfRegistry = getCFRegistryContract(signer);
      const fee: bigint = await cfRegistry.anchorFee();
      const feeTokenAddr: string = await cfRegistry.anchorFeeToken();
      const feeToken = getERC20Contract(feeTokenAddr, signer);
      const [symbol, decimals, allowance] = await Promise.all([
        feeToken.symbol() as Promise<string>,
        feeToken.decimals() as Promise<bigint>,
        feeToken.allowance(signerAddr, CF_REGISTRY_ADDRESS) as Promise<bigint>,
      ]);

      setWalletInfo({
        address: signerAddr,
        chainId: Number(network.chainId),
        balance: `${balance} BNB`,
        feeToken: feeTokenAddr,
        feeSymbol: symbol,
        anchorFee: ethers.formatUnits(fee, decimals),
        allowance: ethers.formatUnits(allowance, decimals),
      });
      setAddress(signerAddr);
      message.success('Wallet info loaded');
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : 'Failed to connect wallet');
    } finally { setWalletLoading(false); }
  };

  const runApprove = async () => {
    setTxLoading(true); setTxError('');
    try {
      const { signer } = await getWalletSigner();
      const cfRegistry = getCFRegistryContract(signer);
      const fee: bigint = await cfRegistry.anchorFee();
      const feeTokenAddr: string = await cfRegistry.anchorFeeToken();
      const feeToken = getERC20Contract(feeTokenAddr, signer);

      message.info('Please approve in your wallet...');
      const approveTx = await feeToken.approve(CF_REGISTRY_ADDRESS, fee);
      message.info('Waiting for confirmation...');
      await approveTx.wait();
      message.success('Approved!');
      // refresh wallet info
      await readWalletInfo();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Approve failed';
      setTxError(msg);
      message.error(msg);
    } finally { setTxLoading(false); }
  };

  const runStep2 = async () => {
    // Use sig1Result or manual inputs
    const cfId = manualCfId || sig1Result?.cf_id || '';
    const validatorDid = manualValidatorDidId || String(sig1Result?.validatorDidId || '');
    const grade = manualGrade || String(sig1Result?.result || '');
    const signature = manualSignature || sig1Result?.signature || '';

    if (!cfId || !validatorDid || !signature) { message.warning('Signature data missing. Run Step 1 first or fill manually.'); return; }
    if (!foodImageUrl) { message.warning('food_image URL required'); return; }
    if (!frontierId) { message.warning('frontier_id required'); return; }
    if (!contributorDidId) { message.warning('contributor_did_id required'); return; }

    setTxLoading(true); setTxError(''); setTxResult(null);
    try {
      const { signer } = await getWalletSigner();
      const cfRegistry = getCFRegistryContract(signer);

      const contentHash = computeContentHash(foodImageUrl);
      const encodedData = encodeSampleData(contentHash, foodImageUrl);

      message.info('Please confirm transaction in your wallet...');
      const tx = await cfRegistry.submitCFWithValidation(
        BigInt(contributorDidId),
        frontierId,
        0, // SAMPLE
        encodedData,
        BigInt(validatorDid),
        Number(grade), // verdict
        Number(grade), // quality grade
        signature,
      );

      message.info('Waiting for tx confirmation...');
      const receipt = await tx.wait();

      setTxResult({ hash: receipt.hash, blockNumber: receipt.blockNumber, cfId });
      message.success('Transaction confirmed!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transaction failed';
      setTxError(msg);
      message.error(msg);
    } finally { setTxLoading(false); }
  };

  /* ═══════════════ Step 3: Submit Chain Data ═══════════════ */
  const [submitTxHash, setSubmitTxHash] = useState('');
  const [submitCfId, setSubmitCfId] = useState('');
  const [submitStatus, setSubmitStatus] = useState('2');
  const [submitBlockNumber, setSubmitBlockNumber] = useState('');
  const [submitFingerprint, setSubmitFingerprint] = useState('');

  const [sub3Loading, setSub3Loading] = useState(false);
  const [sub3Result, setSub3Result] = useState<ChainSubmitResult | null>(null);
  const [sub3Error, setSub3Error] = useState('');

  // auto-fill from step 2
  const fillFromStep2 = () => {
    if (txResult) {
      setSubmitTxHash(txResult.hash);
      setSubmitCfId(txResult.cfId);
      setSubmitBlockNumber(String(txResult.blockNumber));
    }
    if (sig1Result) {
      setSubmitCfId(sig1Result.cf_id);
    }
  };

  const runStep3 = async () => {
    if (!submissionId || !userDid || !address || !submitTxHash || !submitCfId) {
      message.warning('Required fields: submission_id, user_did, address, tx_hash, cf_id');
      return;
    }
    setSub3Loading(true); setSub3Error(''); setSub3Result(null);
    try {
      const res = await submitChainData({
        submissionId,
        status: Number(submitStatus),
        address,
        txHash: submitTxHash,
        cfId: submitCfId,
        userDid,
        chainId: String(BSC_CHAIN_ID),
        blockNumber: submitBlockNumber,
        fingerprint: submitFingerprint,
      });
      setSub3Result(res);
      message.success('Chain data submitted');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submit failed';
      setSub3Error(msg);
      message.error(msg);
    } finally { setSub3Loading(false); }
  };

  /* ── label style ── */
  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1.5";
  const sectionCls = "bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4";

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#FFA800', borderRadius: 10, fontSize: 13 } }}>
      <main className="pt-24 pb-20 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto px-6">

          {/* Header */}
          <header className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-1">Debug / Testing</p>
            <h1 className="text-3xl font-bold text-[#070707]">Chain Anchoring Test</h1>
            <p className="text-sm text-[#6B7280] mt-1">Test each step of the on-chain anchoring flow independently.</p>
          </header>

          {/* Login status */}
          <div className={`mb-4 flex items-center gap-3 p-4 rounded-2xl border ${isLoggedIn ? 'bg-[rgba(34,197,94,0.04)] border-[rgba(34,197,94,0.15)]' : 'bg-[rgba(255,168,0,0.04)] border-[rgba(255,168,0,0.15)]'}`}>
            {isLoggedIn
              ? <><CheckCircle2 className="w-5 h-5 text-[#22C55E]" /><span className="text-sm text-[#070707]">Logged in · <span className="font-mono text-xs">{shorten(walletAddress || '')}</span></span></>
              : <><AlertCircle className="w-5 h-5 text-[#FFA800]" /><span className="text-sm text-[#6B7280]">Not logged in — some fields need manual input</span></>
            }
          </div>

          {/* Last submission info */}
          {lastSubmission && (
            <div className="mb-6 p-4 rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFA800]">Last Submission (auto-loaded)</span>
                <span className="text-[10px] font-mono text-[#9CA3AF]">{lastSubmission.submitted_at ? new Date(lastSubmission.submitted_at).toLocaleString() : ''}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs">
                <div><span className="text-[#9CA3AF]">submission_id:</span> <span className="font-mono text-[#070707]">{shorten(lastSubmission.submission_id)}</span></div>
                <div><span className="text-[#9CA3AF]">food_name:</span> <span className="text-[#070707]">{lastSubmission.food_name}</span></div>
                <div><span className="text-[#9CA3AF]">frontier_id:</span> <span className="font-mono text-[#070707]">{shorten(lastSubmission.frontier_id)}</span></div>
                <div><span className="text-[#9CA3AF]">food_image:</span> <span className="font-mono text-[#070707]">{shorten(lastSubmission.food_image, 24)}</span></div>
              </div>
            </div>
          )}

          {/* Shared Inputs */}
          <div className={sectionCls + ' mb-6'}>
            <h2 className="text-base font-bold text-[#070707] flex items-center gap-2"><Wallet className="w-4 h-4 text-[#FFA800]" /> Common Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>submission_id <span className="text-red-400">*</span></label>
                <Input value={submissionId} onChange={e => setSubmissionId(e.target.value)} placeholder="e.g. 20250814175616122" />
              </div>
              <div>
                <label className={labelCls}>user_did <span className="text-red-400">*</span></label>
                <Input value={userDid} onChange={e => setUserDid(e.target.value)} placeholder="e.g. 2368111111" />
              </div>
              <div>
                <label className={labelCls}>address</label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." />
              </div>
            </div>
            <div className="text-[10px] text-[#9CA3AF]">
              Contract: <span className="font-mono">{shorten(CF_REGISTRY_ADDRESS, 20)}</span> · Chain: BSC ({BSC_CHAIN_ID})
            </div>
          </div>

          {/* ═══════════════ Step 1 ═══════════════ */}
          <div className={sectionCls + ' mb-6'}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070707] flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-[#FFA800]" />
                Step 1 · Get Chain Signature
              </h2>
              <span className="text-[10px] font-mono text-[#9CA3AF]">POST /api/v2/submission/chain/signature</span>
            </div>
            <p className="text-xs text-[#6B7280]">Fetch the backend validation signature needed for the on-chain contract call.</p>

            <div className="flex items-end gap-3">
              <Button type="primary" loading={sig1Loading} onClick={runStep1} className="h-9">
                Get Signature
              </Button>
            </div>

            {sig1Error && <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl"><StatusBadge ok={false} /> {sig1Error}</div>}
            {sig1Result && (
              <div className="space-y-2">
                <StatusBadge ok />
                <JsonBlock data={sig1Result} />
              </div>
            )}
          </div>

          {/* ═══════════════ Step 2 ═══════════════ */}
          <div className={sectionCls + ' mb-6'}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070707] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#FFA800]" />
                Step 2 · Contract Call (submitCFWithValidation)
              </h2>
            </div>
            <p className="text-xs text-[#6B7280]">Connect wallet, approve token, and call the on-chain contract.</p>

            {/* Wallet info */}
            <div className="flex items-center gap-3">
              <Button onClick={readWalletInfo} loading={walletLoading}>Read Wallet & Contract Info</Button>
              <Button onClick={runApprove} loading={txLoading} disabled={!walletInfo}>Approve Fee Token</Button>
            </div>
            {walletInfo && <JsonBlock data={walletInfo} />}

            {/* Contract params */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className={labelCls}>food_image URL <span className="text-red-400">*</span></label>
                <Input value={foodImageUrl} onChange={e => setFoodImageUrl(e.target.value)} placeholder="https://... or ipfs://..." />
              </div>
              <div>
                <label className={labelCls}>frontier_id (bytes32) <span className="text-red-400">*</span></label>
                <Input value={frontierId} onChange={e => setFrontierId(e.target.value)} placeholder="0x..." />
              </div>
              <div>
                <label className={labelCls}>contributor_did_id (uint128) <span className="text-red-400">*</span></label>
                <Input value={contributorDidId} onChange={e => setContributorDidId(e.target.value)} placeholder="e.g. 1001" />
              </div>
            </div>

            {/* Signature overrides (auto-filled from step 1) */}
            <details className="pt-2 border-t border-gray-100">
              <summary className="text-xs font-bold text-[#6B7280] cursor-pointer hover:text-[#070707]">Signature fields (auto-filled from Step 1, or override manually)</summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className={labelCls}>cf_id</label>
                  <Input value={manualCfId || sig1Result?.cf_id || ''} onChange={e => setManualCfId(e.target.value)} placeholder="0x..." />
                </div>
                <div>
                  <label className={labelCls}>validatorDidId</label>
                  <Input value={manualValidatorDidId || String(sig1Result?.validatorDidId || '')} onChange={e => setManualValidatorDidId(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>grade / result</label>
                  <Input value={manualGrade || String(sig1Result?.result || '')} onChange={e => setManualGrade(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>signature</label>
                  <Input.TextArea value={manualSignature || sig1Result?.signature || ''} onChange={e => setManualSignature(e.target.value)} rows={2} className="!text-xs !font-mono" />
                </div>
              </div>
            </details>

            <div className="flex items-center gap-3">
              <Button type="primary" loading={txLoading} onClick={runStep2} className="h-9">
                Submit to Contract
              </Button>
            </div>

            {txError && <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl"><StatusBadge ok={false} /> {txError}</div>}
            {txResult && (
              <div className="space-y-2">
                <StatusBadge ok />
                <div className="flex items-center gap-3 text-xs">
                  <a href={`${BSC_EXPLORER_URL}/tx/${txResult.hash}`} target="_blank" rel="noopener noreferrer"
                    className="text-[#FFA800] font-mono hover:underline flex items-center gap-1">
                    {shorten(txResult.hash)} <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[#9CA3AF]">Block #{txResult.blockNumber}</span>
                </div>
                <JsonBlock data={txResult} />
              </div>
            )}
          </div>

          {/* ═══════════════ Step 3 ═══════════════ */}
          <div className={sectionCls + ' mb-6'}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070707] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#FFA800]" />
                Step 3 · Submit Chain Data to Backend
              </h2>
              <span className="text-[10px] font-mono text-[#9CA3AF]">POST /api/v2/submission/chain/submit</span>
            </div>
            <p className="text-xs text-[#6B7280]">Report the on-chain transaction result back to the backend.</p>

            <div className="flex items-center gap-3">
              <Button size="small" onClick={fillFromStep2}>Auto-fill from Step 1 & 2</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>tx_hash <span className="text-red-400">*</span></label>
                <Input value={submitTxHash} onChange={e => setSubmitTxHash(e.target.value)} placeholder="0x..." />
              </div>
              <div>
                <label className={labelCls}>cf_id <span className="text-red-400">*</span></label>
                <Input value={submitCfId} onChange={e => setSubmitCfId(e.target.value)} placeholder="0x..." />
              </div>
              <div>
                <label className={labelCls}>status (1=进行中, 2=已完成, 3=失败)</label>
                <Input value={submitStatus} onChange={e => setSubmitStatus(e.target.value)} placeholder="2" />
              </div>
              <div>
                <label className={labelCls}>block_number</label>
                <Input value={submitBlockNumber} onChange={e => setSubmitBlockNumber(e.target.value)} placeholder="e.g. 12345678" />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>fingerprint</label>
                <Input value={submitFingerprint} onChange={e => setSubmitFingerprint(e.target.value)} placeholder="content hash (optional)" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="primary" loading={sub3Loading} onClick={runStep3} className="h-9">
                Submit Chain Data
              </Button>
            </div>

            {sub3Error && <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl"><StatusBadge ok={false} /> {sub3Error}</div>}
            {sub3Result && (
              <div className="space-y-2">
                <StatusBadge ok />
                <JsonBlock data={sub3Result} />
              </div>
            )}
          </div>

        </div>
      </main>
    </ConfigProvider>
  );
}
