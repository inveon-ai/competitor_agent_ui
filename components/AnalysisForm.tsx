'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AREAS, runFullAnalysis, runSingleAnalysis, type AreaId } from '@/lib/api'

export default function AnalysisForm() {
  const router = useRouter()
  const [companyId, setCompanyId] = useState('')
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<'full' | 'single'>('full')
  const [selectedAreas, setSelectedAreas] = useState<Set<AreaId>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleArea(id: AreaId) {
    setSelectedAreas(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!companyId.trim() || !url.trim()) {
      setError('Company ID ve URL zorunludur.')
      return
    }
    if (mode === 'single' && selectedAreas.size === 0) {
      setError('En az bir analiz alanı seçiniz.')
      return
    }

    setLoading(true)
    try {
      const body = { company_id: companyId.trim(), url: url.trim() }

      if (mode === 'full') {
        const res = await runFullAnalysis(body)
        const params = res.analysis_id ? `?aid=${res.analysis_id}` : ''
        router.push(`/jobs/${res.job_id}${params}`)
      } else {
        const [firstArea] = selectedAreas
        const res = await runSingleAnalysis(firstArea, body)
        router.push(`/jobs/${res.job_id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Company ID</label>
          <input
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
            placeholder="inveon"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Rakip URL</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mode selector */}
      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Analiz Türü</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode('full')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'full'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🚀 Tüm Analizler
          </button>
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🎯 Tek Alan
          </button>
        </div>
      </div>

      {/* Area checkboxes (only in single mode) */}
      {mode === 'single' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AREAS.map(area => (
            <button
              key={area.id}
              type="button"
              onClick={() => toggleArea(area.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedAreas.has(area.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{area.emoji}</span>
              <span>{area.label}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
      >
        {loading ? 'Başlatılıyor…' : 'Analizi Başlat'}
      </button>
    </form>
  )
}
