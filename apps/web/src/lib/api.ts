import type { RiskScoreResult, TriggerActive } from '@shieldride/shared'
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { ApiEnvelope, IncomeDay, PayoutRow, SensorLatest, WorkerProfile } from '@/types'
import { useWorkerStore } from '@/stores/workerStore'

function resolvedRequestUrl(cfg: InternalAxiosRequestConfig): string {
  const path = (cfg.baseURL ?? '') + (cfg.url ?? '')
  if (path.startsWith('http')) return path
  if (typeof window !== 'undefined') {
    try {
      return new URL(path, window.location.origin).href
    } catch {
      return path
    }
  }
  return path || '(unknown URL)'
}

function bodySnippet(body: unknown): string {
  if (body == null) return '(empty body)'
  if (typeof body === 'string') {
    const t = body.trim().slice(0, 160)
    return body.includes('<!DOCTYPE') || body.includes('<html')
      ? `HTML document (${t.length} chars shown): ${t}…`
      : `text: ${t}${body.length > 160 ? '…' : ''}`
  }
  try {
    return JSON.stringify(body).slice(0, 200)
  } catch {
    return String(body)
  }
}

// Development: always use same-origin `/api` so Vite proxies to the API (vite.config server.proxy).
// Avoid VITE_API_URL=http://localhost:3001 in dev — that bypasses the proxy and fails with ERR_NETWORK if the API is down.
// Production / preview: set VITE_API_URL at build time (e.g. https://shieldride-api.vercel.app).
// To call a remote API from the Vite dev server, set VITE_DEV_API_URL (see below).
const envApi = import.meta.env.VITE_API_URL?.trim() ?? ''
const devDirectApi = import.meta.env.VITE_DEV_API_URL?.trim() ?? ''
const baseURL = import.meta.env.DEV
  ? devDirectApi || ''
  : envApi

export const api = axios.create({
  baseURL,
  timeout: 25_000,
  // Our API returns JSON envelopes for 4xx/5xx; parse them instead of Axios' generic "status code 404".
  validateStatus: () => true,
})

api.interceptors.request.use((config) => {
  const token = useWorkerStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function isEnvelope(x: unknown): x is ApiEnvelope<unknown> {
  return (
    typeof x === 'object' &&
    x !== null &&
    'data' in x &&
    'error' in x &&
    'meta' in x
  )
}

export async function unwrap<T>(p: Promise<AxiosResponse<unknown>>): Promise<T> {
  try {
    const res = await p
    const body = res.data

    if (isEnvelope(body)) {
      if (body.error) {
        throw new Error(body.error.message)
      }
      if (body.data === null) {
        throw new Error('Empty response')
      }
      return body.data as T
    }

    const reqUrl = resolvedRequestUrl(res.config)
    const method = (res.config.method ?? 'get').toUpperCase()

    if (res.status === 404) {
      const hint = import.meta.env.DEV
        ? 'Local: run `npm run dev:web` from repo root (API on :3001, Vite proxies /api). Do not open `dist/` as static files.'
        : 'Production: redeploy web so `vercel.web.json` /api rewrites apply, set VITE_API_URL at build, or hard-refresh and unregister the PWA service worker (old bundles cache this error).'
      throw new Error(
        `API 404 for ${method} ${reqUrl}. ${hint} Body: ${bodySnippet(body)}`,
      )
    }
    throw new Error(`Request failed ${method} ${reqUrl} → HTTP ${res.status}. Body: ${bodySnippet(body)}`)
  } catch (e) {
    const ax = e as AxiosError<ApiEnvelope<unknown>>
    if (ax.response?.data && isEnvelope(ax.response.data) && ax.response.data.error) {
      throw new Error(ax.response.data.error.message)
    }
    if (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error') {
      throw new Error(
        import.meta.env.DEV
          ? 'Cannot reach API. From repo root run: npm run dev:web (starts API on 3001 + Vite). Or run `npm run dev --workspace @shieldride/api` in one terminal and `npm run dev --workspace @shieldride/web` in another. Do not set VITE_API_URL to localhost in apps/web/.env — leave it unset so /api uses the Vite proxy.'
          : 'Cannot reach API. Check VITE_API_URL and that the API is online.',
      )
    }
    throw e
  }
}

export const sensorsApi = {
  latest: (city: string) => unwrap<SensorLatest>(api.get(`/api/sensors/latest?city=${encodeURIComponent(city)}`)),
  risk: (city: string) => unwrap<RiskScoreResult>(api.get(`/api/sensors/risk?city=${encodeURIComponent(city)}`)),
  triggers: (city: string) =>
    unwrap<TriggerActive[]>(api.get(`/api/sensors/triggers?city=${encodeURIComponent(city)}`)),
}

export type VerifyOtpData = {
  token: string
  worker: {
    id: string
    name: string
    city: string
    platform: string
    phone: string
    upiHandle: string
  } | null
}

export const authApi = {
  sendOtp: (phone: string) => unwrap(api.post('/api/auth/send-otp', { phone })),
  verifyOtp: (phone: string, otp: string) =>
    unwrap<VerifyOtpData>(api.post('/api/auth/verify-otp', { phone, otp })),
}

export const premiumApi = {
  calculate: (city: string) =>
    unwrap<{ weeklyPremiumRupees: number; city: string }>(api.post('/api/premium/calculate', { city })),
}

export const workersApi = {
  get: (id: string) => unwrap<WorkerProfile>(api.get(`/api/workers/${id}`)),
  create: (body: {
    phone: string
    name: string
    city: string
    email?: string
    pincode?: string
    platform?: 'zepto' | 'blinkit' | 'swiggy'
    upiHandle: string
    aadhaarLast4?: string
    baselineIncomeRupees?: number
    deviceFingerprint?: string
  }) =>
    unwrap<{ id: string; name: string; city: string; platform: string; phone: string; email?: string | null; upiHandle?: string }>(
      api.post('/api/workers', body),
    ),
  update: (
    id: string,
    body: Partial<{
      name: string
      city: string
      pincode: string
      upiHandle: string
      email: string
      platform: 'zepto' | 'blinkit' | 'swiggy'
    }>,
  ) =>
    unwrap<{ id: string; name: string; city: string; platform: string; upiHandle: string; email?: string | null; pincode?: string }>(
      api.put(`/api/workers/${id}`, body),
    ),
  income: (id: string) => unwrap<IncomeDay[]>(api.get(`/api/workers/${id}/income`)),
}

export const policiesApi = {
  create: (workerId: string, weekStartIso: string) =>
    unwrap<{ id: string; premiumAmountPaise: number; riskScore: number; status: string; weekStart: string; weekEnd: string }>(
      api.post('/api/policies', { workerId, weekStart: weekStartIso }),
    ),
  pay: (policyId: string, upiRef: string) =>
    unwrap<{ id: string; premiumPaidAt: string | null; status: string; upiRef: string }>(
      api.post(`/api/policies/${policyId}/pay`, { upiRef }),
    ),
}

export const payoutsApi = {
  list: (workerId: string) =>
    unwrap<PayoutRow[]>(api.get(`/api/payouts?workerId=${encodeURIComponent(workerId)}`)),
}
