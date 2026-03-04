'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getJob, type JobDetailResponse, AREAS } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-gray-700 text-gray-300',
  running:   'bg-blue-700 text-blue-100',
  completed: 'bg-green-700 text-green-100',
  failed:    'bg-red-700 text-red-100',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  )
}

export default function JobPoller({ jobId, analysisId }: { jobId: string; analysisId?: string }) {
  const [job, setJob] = useState<JobDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function poll() {
      try {
        const data = await getJob(jobId)
        if (!active) return
        setJob(data)
        if (data.status !== 'completed' && data.status !== 'failed') {
          setTimeout(poll, 3000)
        }
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Polling hatası')
      }
    }

    poll()
    return () => { active = false }
  }, [jobId])

  if (error) return (
    <div className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4">{error}</div>
  )

  if (!job) return (
    <div className="text-gray-400 animate-pulse">Yükleniyor…</div>
  )

  const summary = job.progress_summary
  const pct = summary?.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={job.status} />
        <span className="text-sm text-gray-400 font-mono">{job.job_id}</span>
        {job.company_id && <span className="text-sm text-gray-500">· {job.company_id}</span>}
      </div>

      {/* Progress bar */}
      {summary && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{summary.completed} / {summary.total} tamamlandı</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-3 text-xs text-gray-500">
            {summary.running > 0 && <span>🔄 {summary.running} çalışıyor</span>}
            {summary.failed > 0 && <span>❌ {summary.failed} hata</span>}
            {summary.pending > 0 && <span>⏳ {summary.pending} bekliyor</span>}
          </div>
        </div>
      )}

      {/* Sub-jobs grid */}
      {job.sub_jobs && job.sub_jobs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {job.sub_jobs.map(sub => {
            const areaInfo = AREAS.find(a => a.id === sub.insight_area || a.id.replace(/-/g, '_') === sub.insight_area?.replace(/-/g, '_'))
            return (
              <div
                key={sub.job_id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {areaInfo ? `${areaInfo.emoji} ${areaInfo.label}` : sub.insight_area}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>
                {sub.progress && (
                  <p className="text-xs text-gray-500 truncate">{sub.progress}</p>
                )}
                {sub.duration_ms > 0 && (
                  <p className="text-xs text-gray-600">{(sub.duration_ms / 1000).toFixed(1)}s</p>
                )}
                {sub.error && (
                  <p className="text-xs text-red-400 truncate">{sub.error}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tamamlandı — sonuç linki */}
      {job.status === 'completed' && analysisId && (
        <Link
          href={`/results/${analysisId}`}
          className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors"
        >
          ✅ Sonuçları Gör →
        </Link>
      )}

      {/* Single job (alan bazlı) — result içindeki analysis_id ile sonuç linki */}
      {job.status === 'completed' && !analysisId && job.result && (
        (() => {
          const resultAnalysisId = (job.result as Record<string, unknown>)?.analysis_id as string | undefined
          return resultAnalysisId ? (
            <Link
              href={`/results/${resultAnalysisId}`}
              className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors"
            >
              ✅ Sonuçları Gör →
            </Link>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-sm text-green-400 font-medium mb-2">✅ Analiz tamamlandı</p>
              <pre className="text-xs text-gray-400 overflow-auto max-h-64 whitespace-pre-wrap">
                {JSON.stringify(job.result, null, 2)}
              </pre>
            </div>
          )
        })()
      )}

      {/* Back link */}
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">← Yeni Analiz</Link>
    </div>
  )
}
