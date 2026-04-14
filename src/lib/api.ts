const BASE_URL = '';

function getToken(): string {
  return localStorage.getItem('auth') || '';
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const token = getToken();
  if (token) headers['token'] = token;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.errorMessage || 'API error');
  return json.data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function getNonce(accountType: 'block_chain' | 'email' = 'block_chain'): Promise<string> {
  const data = await request<string>('POST', '/api/v2/user/nonce', { account_type: accountType });
  return data;
}

export interface LoginResult {
  token: string;
  user_id: string;
  did: string;
  cancel_flag: number;
}

export async function loginWithWallet(params: {
  address: string;
  nonce: string;
  signature: string;
  message: string;
  walletName: string;
  chain: string;
}): Promise<LoginResult> {
  return request<LoginResult>('POST', '/api/v2/user/login', {
    restore_login: 0,
    account_type: 'block_chain',
    account_enum: 'C',
    connector: 'codatta_wallet',
    inviter_code: '',
    wallet_name: params.walletName,
    address: params.address,
    chain: params.chain,
    nonce: params.nonce,
    signature: params.signature,
    message: params.message,
    source: {
      device: 'WEB',
      channel: 'codatta-platform-website',
      app: 'codatta-platform-website',
    },
  });
}

export interface UserInfo {
  user_data: {
    user_id: string;
    user_name: string | null;
    avatar: string;
    did: string;
  };
  accounts_data: Array<{
    account_type: string;
    account: string;
    current_account: boolean;
    wallet_name: string;
    chain: string;
  }>;
  user_assets: Array<{
    asset_type: string;
    balance: { currency: string; amount: string };
    available_amount: number;
  }>;
  user_reputation: number;
}

export async function getUserInfo(): Promise<UserInfo> {
  return request<UserInfo>('POST', '/api/v2/user/get/user_info');
}

// ── Frontier ──────────────────────────────────────────────────────────────────

export interface FrontierItem {
  frontier_id: string;
  title: string;
  description: { frontier_desc: string };
  logo_url: string;
  status: string;
  difficulty_level: number;
  participants: number;
  avatars: string[];
  task: {
    task_id: string;
    task_type: string;
    name: string;
    template_id: string;
    reward_info: Array<{ reward_type: string; reward_value: number; reward_icon: string; reward_mode: string }>;
    status: string;
  };
}

export async function getFrontierList(): Promise<FrontierItem[]> {
  return request<FrontierItem[]>('POST', '/api/v2/frontier/list', {
    status: 'ONLINE',
    channel: 'demo',
  });
}

export async function getTaskDetail(taskId: string) {
  return request('POST', '/api/v2/frontier/task/detail', { task_id: taskId });
}

// ── Submission ────────────────────────────────────────────────────────────────

export interface SubmissionStats {
  all_count: number;
  total_submissions: number;
  total_rewards: Array<{ reward_type: string; reward_amount: number }>;
  on_chained: number;
  claimable_rewards: unknown[];
}

export async function getSubmissionStats(): Promise<SubmissionStats> {
  return request<SubmissionStats>('GET', '/api/v2/submission/user/statics?channel=demo');
}

export interface SubmissionRecord {
  submission_id: string;
  frontier_id: string;
  frontier_name: string;
  task_id: string;
  task_type: string;
  task_type_name: string;
  template_id: string;
  current_status: string;
  status: string;
  create_time: number;
  reward_info: Array<{ reward_type: string; reward_value: number; reward_mode: string; reward_icon: string }>;
  reward_points: number;
  reward_show_name: string;
  audit_reason: string | null;
  chain_status: number | null;
  txHashUrl: string | null;
  hf_dataset_url: string;
  data_submission: { data: Record<string, unknown> };
}

export async function getSubmissionList(params?: {
  frontierIds?: string;
  currentStatus?: string;
  pageNum?: number;
  pageSize?: number;
}): Promise<{ list: SubmissionRecord[]; total: number }> {
  // The API wraps response as { data: [...records], total_count, total_page, page, success, ... }
  // Our request() helper already unwraps .data, so we get the array directly.
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['token'] = token;

  const res = await fetch(`${BASE_URL}/api/v2/submission/list`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channel: 'demo',
      page_num: params?.pageNum ?? 1,
      page_size: params?.pageSize ?? 20,
      task_types: 'submission',
      current_status: params?.currentStatus ?? '',
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.errorMessage || 'API error');

  // data is the records array, total_count is at the top level
  const list: SubmissionRecord[] = Array.isArray(json.data) ? json.data : [];
  const total = json.total_count ?? list.length;
  return { list, total };
}

export interface TaskSubmitResult {
  submission_id: string;
  user_id: string;
  task_id: string;
  status: string;
  reward_info: Array<{ reward_type: string; reward_value: number }>;
}

export async function submitTask(params: {
  taskId: string;
  templateId: string;
  data: Record<string, unknown>;
}): Promise<TaskSubmitResult> {
  return request<TaskSubmitResult>(
    'POST',
    '/api/v2/frontier/task/submit',
    {
      task_id: params.taskId,
      data_submission: {
        taskId: params.taskId,
        templateId: params.templateId,
        channel: 'demo',
        device: 'web',
        data: params.data,
      },
    },
    { device: 'WEB', channel: 'codatta-platform-website' }
  );
}

// ── File Upload ───────────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('content_type', file.type);

  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/v2/file/upload`, {
    method: 'POST',
    headers: token ? { token } : {},
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.errorMessage || 'Upload failed');
  return json.data.file_path as string;
}

// ── Chain Submit ─────────────────────────────────────────────────────────────

export interface ChainSubmitResult {
  chain_status: number; // 1 success, 0 fail
}

export async function submitChainData(params: {
  submissionId: string;
  status: number; // 1 进行中, 2 已完成, 3 失败
  address: string;
  txHash: string;
  chainId?: string;
  blockNumber?: string;
  fingerprint?: string;
}): Promise<ChainSubmitResult> {
  return request<ChainSubmitResult>('POST', '/api/v2/submission/chain/submit', {
    submission_id: params.submissionId,
    status: params.status,
    address: params.address,
    tx_hash: params.txHash,
    chain_id: params.chainId ?? '',
    block_number: params.blockNumber ?? '',
    fingerprint: params.fingerprint ?? '',
  });
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export function saveToken(res: { token: string; old_token?: string; user_id: string }) {
  localStorage.setItem('auth', res.token);
  localStorage.setItem('token', res.old_token || '');
  localStorage.setItem('uid', res.user_id);
}

export function clearToken() {
  localStorage.removeItem('auth');
  localStorage.removeItem('token');
  localStorage.removeItem('uid');
}

export function hasToken(): boolean {
  return !!localStorage.getItem('auth');
}
