import { useState, useEffect } from 'react';
import { ConfigProvider, Input, Button, message } from 'antd';
import { CheckCircle2, AlertCircle, Copy, ExternalLink, Wallet, FileSignature, Link2, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useCodattaConnectContext } from 'codatta-connect';
import { checksumAddress } from 'viem';
import { getChainSignature, submitChainData, statusToVerdict, type ChainSignatureResponse, type ChainSubmitResult } from '@/lib/api';
import CFRegistryContract from '@/contracts/cf-registry';
import {
  publicClient,
  CF_REGISTRY_ADDRESS,
  CHAIN_EXPLORER_URL,
  CHAIN_ID,
  CHAIN_NAME,
  encodeSampleData,
  computeContentHash,
  toBytes32,
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
  const { walletAddress, isLoggedIn } = useApp();
  const { lastUsedWallet } = useCodattaConnectContext();
  const userInfo = null; // demo mode — no real user info

  // ── shared inputs ──
  const [submissionId, setSubmissionId] = useState('');
  const [userDid, setUserDid] = useState('');
  const [address, setAddress] = useState('');

  // ── Step 2 inputs ──
  const [foodImageUrl, setFoodImageUrl] = useState('');
  const [frontierId, setFrontierId] = useState('');
  const [contributorDidId, setContributorDidId] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastSubmission, setLastSubmission] = useState<Record<string, any> | null>(null);

  // Auto-fill on mount
  useEffect(() => {
    if (walletAddress) setAddress(walletAddress);
    // demo mode: userInfo always null

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
  const [manualCfId, setManualCfId] = useState('');
  const [manualValidatorDidId, setManualValidatorDidId] = useState('');
  const [manualGrade, setManualGrade] = useState('');
  const [manualSignature, setManualSignature] = useState('');

  const [txLoading, setTxLoading] = useState(false);
  const [txResult, setTxResult] = useState<{ hash: string; blockNumber: number; cfId: string } | null>(null);
  const [txError, setTxError] = useState('');

  // Wallet & contract info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [walletInfo, setWalletInfo] = useState<Record<string, any> | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const readWalletInfo = async () => {
    if (!lastUsedWallet?.address) { message.warning('Wallet not connected'); return; }
    setWalletLoading(true);
    try {
      const addr = checksumAddress(lastUsedWallet.address as `0x${string}`);
      const balance = await publicClient.getBalance({ address: addr });
      const anchorFee = await publicClient.readContract({ address: CF_REGISTRY_ADDRESS, abi: CFRegistryContract.abi, functionName: 'anchorFee' }) as bigint;
      const feeTokenAddr = await publicClient.readContract({ address: CF_REGISTRY_ADDRESS, abi: CFRegistryContract.abi, functionName: 'anchorFeeToken' }) as string;

      const { formatEther } = await import('viem');
      setWalletInfo({
        address: addr,
        chainId: CHAIN_ID,
        balance: `${formatEther(balance)} ETH`,
        anchorFee: anchorFee === 0n ? '0 (Free)' : anchorFee.toString(),
        feeToken: feeTokenAddr,
      });
      setAddress(addr);
      message.success('Wallet info loaded');
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : 'Failed');
    } finally { setWalletLoading(false); }
  };

  const runStep2 = async () => {
    const cfId = manualCfId || sig1Result?.cf_id || '';
    const validatorDid = manualValidatorDidId || sig1Result?.validatorDidId || '';
    const gradeStr = manualGrade || String(sig1Result?.result ?? '');
    const signature = manualSignature || sig1Result?.signature || '';
    const verdictNum = sig1Result ? statusToVerdict(sig1Result.status) : Number(gradeStr);

    if (!cfId || !validatorDid || !signature) { message.warning('Run Step 1 first or fill signature fields manually.'); return; }
    if (!foodImageUrl) { message.warning('food_image URL required'); return; }
    if (!frontierId) { message.warning('frontier_id required'); return; }
    if (!contributorDidId) { message.warning('contributor_did_id required'); return; }
    if (!lastUsedWallet?.client) { message.warning('Wallet not connected'); return; }

    setTxLoading(true); setTxError(''); setTxResult(null);
    try {
      const walletAddr = checksumAddress(lastUsedWallet.address as `0x${string}`);

      // Switch chain if needed
      const chainId = await lastUsedWallet.getChain();
      if (chainId !== CHAIN_ID) {
        await lastUsedWallet.switchChain(CFRegistryContract.chain);
      }

      const contentHash = computeContentHash(foodImageUrl);
      const encodedData = encodeSampleData(contentHash, foodImageUrl);
      const frontierIdBytes32 = toBytes32(frontierId);

      const args = [
        BigInt(contributorDidId),
        frontierIdBytes32,
        0,
        encodedData,
        BigInt(validatorDid),
        verdictNum,
        Number(gradeStr),
        signature as `0x${string}`,
      ] as const;

      // Simulate
      message.info('Simulating contract call...');
      const { request } = await publicClient.simulateContract({
        account: walletAddr,
        address: CF_REGISTRY_ADDRESS,
        abi: CFRegistryContract.abi,
        functionName: 'submitCFWithValidation',
        args,
        chain: CFRegistryContract.chain,
      });

      // Write
      message.info('Please confirm transaction in your wallet...');
      const txHash = await lastUsedWallet.client.writeContract(request);

      // Wait
      message.info('Waiting for tx confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      setTxResult({ hash: txHash, blockNumber: Number(receipt.blockNumber), cfId });
      message.success(receipt.status === 'success' ? 'Transaction confirmed!' : 'Transaction reverted!');
    } catch (e: unknown) {
      const err = e as { details?: string; message?: string };
      const msg = err.details || err.message || 'Transaction failed';
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

  const fillFromStep2 = () => {
    if (txResult) {
      setSubmitTxHash(txResult.hash);
      setSubmitCfId(txResult.cfId);
      setSubmitBlockNumber(String(txResult.blockNumber));
    } else if (sig1Result) {
      setSubmitCfId(sig1Result.cf_id);
    }
  };

  const runStep3 = async () => {
    if (!submissionId || !userDid || !address || !submitTxHash || !submitCfId) {
      message.warning('Required: submission_id, user_did, address, tx_hash, cf_id');
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
        chainId: String(CHAIN_ID),
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

  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1.5";
  const sectionCls = "bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4";

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#FFA800', borderRadius: 10, fontSize: 13 } }}>
      <main className="pt-24 pb-20 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto px-6">

          <header className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-1">Debug / Testing</p>
            <h1 className="text-3xl font-bold text-[#070707]">Chain Anchoring Test</h1>
            <p className="text-sm text-[#6B7280] mt-1">Test each step of the on-chain anchoring flow (gas fee = 0).</p>
          </header>

          {/* Login status */}
          <div className={`mb-4 flex items-center gap-3 p-4 rounded-2xl border ${isLoggedIn ? 'bg-[rgba(34,197,94,0.04)] border-[rgba(34,197,94,0.15)]' : 'bg-[rgba(255,168,0,0.04)] border-[rgba(255,168,0,0.15)]'}`}>
            {isLoggedIn
              ? <><CheckCircle2 className="w-5 h-5 text-[#22C55E]" /><span className="text-sm text-[#070707]">Logged in · <span className="font-mono text-xs">{shorten(walletAddress || '')}</span></span></>
              : <><AlertCircle className="w-5 h-5 text-[#FFA800]" /><span className="text-sm text-[#6B7280]">Not logged in</span></>
            }
          </div>

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
              Contract: <span className="font-mono">{shorten(CF_REGISTRY_ADDRESS, 20)}</span> · Chain: {CHAIN_NAME} ({CHAIN_ID}) · Gas: Free
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
            <p className="text-xs text-[#6B7280]">Fetch backend validation signature for the contract call.</p>

            <Button type="primary" loading={sig1Loading} onClick={runStep1} className="h-9">Get Signature</Button>

            {sig1Error && <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl"><StatusBadge ok={false} /> {sig1Error}</div>}
            {sig1Result && (
              <div className="space-y-2">
                <StatusBadge ok />
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="px-2 py-1 bg-gray-100 rounded-lg">status: <b>{sig1Result.status}</b> → verdict: <b>{statusToVerdict(sig1Result.status)}</b> ({['PENDING','APPROVED','REJECTED'][statusToVerdict(sig1Result.status)]})</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-lg">result: <b>{sig1Result.result}</b> → grade: <b>{['NONE','D','C','B','A','S'][sig1Result.result] || sig1Result.result}</b></span>
                </div>
                <JsonBlock data={sig1Result} />
              </div>
            )}
          </div>

          {/* ═══════════════ Step 2 ═══════════════ */}
          <div className={sectionCls + ' mb-6'}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070707] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#FFA800]" />
                Step 2 · submitCFWithValidation (Direct Contract Call)
              </h2>
            </div>
            <p className="text-xs text-[#6B7280]">Call the on-chain contract directly. Gas fee is 0 — anchor fee read from contract.</p>

            <div className="flex items-center gap-3">
              <Button onClick={readWalletInfo} loading={walletLoading}>Read Wallet &amp; Contract Info</Button>
            </div>
            {walletInfo && <JsonBlock data={walletInfo} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className={labelCls}>food_image URL <span className="text-red-400">*</span></label>
                <Input value={foodImageUrl} onChange={e => setFoodImageUrl(e.target.value)} placeholder="https://..." />
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

            <details className="pt-2 border-t border-gray-100">
              <summary className="text-xs font-bold text-[#6B7280] cursor-pointer hover:text-[#070707]">Signature overrides (auto-filled from Step 1)</summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div><label className={labelCls}>cf_id</label><Input value={manualCfId || sig1Result?.cf_id || ''} onChange={e => setManualCfId(e.target.value)} /></div>
                <div><label className={labelCls}>validatorDidId</label><Input value={manualValidatorDidId || sig1Result?.validatorDidId || ''} onChange={e => setManualValidatorDidId(e.target.value)} /></div>
                <div><label className={labelCls}>grade (result)</label><Input value={manualGrade || String(sig1Result?.result ?? '')} onChange={e => setManualGrade(e.target.value)} /></div>
                <div><label className={labelCls}>signature</label><Input.TextArea value={manualSignature || sig1Result?.signature || ''} onChange={e => setManualSignature(e.target.value)} rows={2} className="!text-xs !font-mono" /></div>
              </div>
            </details>

            <Button type="primary" loading={txLoading} onClick={runStep2} className="h-9">Submit to Contract</Button>

            {txError && <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl"><StatusBadge ok={false} /> {txError}</div>}
            {txResult && (
              <div className="space-y-2">
                <StatusBadge ok />
                <div className="flex items-center gap-3 text-xs">
                  <a href={`${CHAIN_EXPLORER_URL}/tx/${txResult.hash}`} target="_blank" rel="noopener noreferrer"
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
            <p className="text-xs text-[#6B7280]">Report on-chain transaction result back to the backend.</p>

            <Button size="small" onClick={fillFromStep2}>Auto-fill from Step 1 &amp; 2</Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>tx_hash <span className="text-red-400">*</span></label><Input value={submitTxHash} onChange={e => setSubmitTxHash(e.target.value)} placeholder="0x..." /></div>
              <div><label className={labelCls}>cf_id <span className="text-red-400">*</span></label><Input value={submitCfId} onChange={e => setSubmitCfId(e.target.value)} placeholder="0x..." /></div>
              <div><label className={labelCls}>status (1=进行中, 2=已完成, 3=失败)</label><Input value={submitStatus} onChange={e => setSubmitStatus(e.target.value)} placeholder="2" /></div>
              <div><label className={labelCls}>block_number</label><Input value={submitBlockNumber} onChange={e => setSubmitBlockNumber(e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>fingerprint</label><Input value={submitFingerprint} onChange={e => setSubmitFingerprint(e.target.value)} placeholder="content hash (optional)" /></div>
            </div>

            <Button type="primary" loading={sub3Loading} onClick={runStep3} className="h-9">Submit Chain Data</Button>

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
