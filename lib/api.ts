const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://competitor-agent.dev.inveon.ai'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}

export interface AnalysisRequest {
  company_id: string
  url: string
}

export interface SubJobInfo {
  job_id: string
  insight_area: string
  status: string
}

export interface FullJobResponse {
  job_id: string
  status: string
  insight_areas: string[]
  sub_jobs: SubJobInfo[]
  company_id: string
  url: string
  created_at: string
  analysis_id: string
}

export interface JobResponse {
  job_id: string
  status: string
  insight_area: string
  company_id: string
  url: string
  created_at: string
}

export interface SubJobDetail {
  job_id: string
  insight_area: string
  status: string
  progress: string
  error: string
  started_at: string
  completed_at: string
  duration_ms: number
  analysis_id: string
}

export interface ProgressSummary {
  total: number
  completed: number
  running: number
  failed: number
  pending: number
}

export interface JobDetailResponse {
  job_id: string
  status: string
  insight_area: string
  company_id: string
  url: string
  progress: string
  error: string
  created_at: string
  updated_at: string
  started_at: string
  completed_at: string
  duration_ms: number
  parent_job_id: string
  sub_jobs: SubJobDetail[]
  progress_summary: ProgressSummary
  result: Record<string, unknown>
}

export interface AnalysisResultResponse {
  analysis_id: string
  company_id: string
  company_name: string
  rival_id: string
  rival_domain: string
  rival_brand_name: string
  type: string
  status: string
  pipeline_version: string
  created_at: string
  completed_at: string
  duration_ms: number
  areas: Record<string, unknown>
}

export const AREAS = [
  { id: 'price-strategy',    label: 'Fiyat Stratejisi',  emoji: '💰' },
  { id: 'promotions',        label: 'Promosyonlar',       emoji: '🎁' },
  { id: 'product-portfolio', label: 'Ürün Portföyü',      emoji: '📦' },
  { id: 'shipping-policies', label: 'Kargo Politikası',   emoji: '🚚' },
  { id: 'digital-trends',    label: 'Dijital Trendler',   emoji: '📈' },
  { id: 'ux-analysis',       label: 'UX Analizi',         emoji: '🎨' },
] as const

export type AreaId = typeof AREAS[number]['id']

export function runFullAnalysis(body: AnalysisRequest): Promise<FullJobResponse> {
  return post('/api/v1/analysis/full', body)
}

export function runSingleAnalysis(area: AreaId, body: AnalysisRequest): Promise<JobResponse> {
  return post(`/api/v1/analysis/${area}`, body)
}

export function getJob(job_id: string): Promise<JobDetailResponse> {
  return get(`/api/v1/analysis/jobs/${job_id}`)
}

export function getResultDetail(analysis_id: string): Promise<AnalysisResultResponse> {
  return get(`/api/v1/analysis/results/${analysis_id}`)
}
