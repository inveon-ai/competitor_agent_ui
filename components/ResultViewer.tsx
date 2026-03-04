'use client'

import { useState } from 'react'
import type { AnalysisResultResponse } from '@/lib/api'
import { AREAS } from '@/lib/api'

interface InsightData {
  headline?: string
  executive_summary?: string
  key_insight?: { finding?: string; so_what?: string }
  strategic_action?: { do_this?: string; expected_impact?: string }
}

interface AreaData {
  status?: string
  result?: Record<string, unknown>
  insight?: {
    metadata?: Record<string, unknown>
    data?: Record<string, InsightData>
  }
}

function AreaCard({ areaKey, data }: { areaKey: string; data: unknown }) {
  const [open, setOpen] = useState(true)
  const areaInfo = AREAS.find(
    a => a.id === areaKey || a.id.replace(/-/g, '_') === areaKey
  )
  const label = areaInfo ? `${areaInfo.emoji} ${areaInfo.label}` : areaKey

  const areaData = data as AreaData
  const result = areaData?.result
  const insightData = areaData?.insight?.data
  // insight key dinamik: "promotions_insight", "price_strategy_insight" vb.
  const insightKey = insightData ? Object.keys(insightData)[0] : undefined
  const insight: InsightData | undefined = insightKey ? insightData?.[insightKey] : undefined

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors text-left"
      >
        <span className="font-medium text-sm">{label}</span>
        <span className="text-gray-500 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-5 border-t border-gray-800 pt-4">

          {/* Insight bölümü */}
          {insight ? (
            <div className="space-y-4">
              {insight.headline && (
                <p className="text-base font-semibold text-white leading-snug">
                  {insight.headline}
                </p>
              )}

              {insight.executive_summary && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Özet</p>
                  <p className="text-sm text-gray-300">{insight.executive_summary}</p>
                </div>
              )}

              {insight.key_insight && (
                <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Temel Bulgu</p>
                  {insight.key_insight.finding && (
                    <p className="text-sm text-gray-200">{insight.key_insight.finding}</p>
                  )}
                  {insight.key_insight.so_what && (
                    <p className="text-sm text-yellow-300/80 italic">{insight.key_insight.so_what}</p>
                  )}
                </div>
              )}

              {insight.strategic_action && (
                <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-blue-400 uppercase tracking-wide">Stratejik Aksiyon</p>
                  {insight.strategic_action.do_this && (
                    <p className="text-sm text-gray-200">
                      <span className="font-medium">Ne yapmalı: </span>
                      {insight.strategic_action.do_this}
                    </p>
                  )}
                  {insight.strategic_action.expected_impact && (
                    <p className="text-sm text-green-300/80">
                      <span className="font-medium">Beklenen etki: </span>
                      {insight.strategic_action.expected_impact}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-600 italic">Insight verisi bulunamadı.</p>
          )}

          {/* Metrikler */}
          {result && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Metrikler</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(result).map(([k, v]) => {
                  if (Array.isArray(v)) {
                    return (
                      <div key={k} className="col-span-2 sm:col-span-3 bg-gray-800 rounded p-2">
                        <p className="text-xs text-gray-500 mb-1">{k}</p>
                        <div className="flex flex-wrap gap-1">
                          {v.map((item, i) => (
                            <span key={i} className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                              {String(item)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  if (typeof v === 'object' && v !== null) return null
                  return (
                    <div key={k} className="bg-gray-800 rounded p-2">
                      <p className="text-xs text-gray-500 truncate">{k}</p>
                      <p className="text-sm font-medium">{String(v)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultViewer({ result }: { result: AnalysisResultResponse }) {
  const durationSec = result.duration_ms ? (result.duration_ms / 1000).toFixed(1) : null
  const areaEntries = result.areas ? Object.entries(result.areas) : []

  return (
    <div className="space-y-6">
      {/* Meta kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Şirket', value: result.company_name || result.company_id },
          { label: 'Rakip', value: result.rival_brand_name || result.rival_domain || '—' },
          { label: 'Tür', value: result.type || '—' },
          { label: 'Süre', value: durationSec ? `${durationSec}s` : '—' },
        ].map(item => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
            <p className="text-sm font-medium truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Alan sonuçları */}
      {areaEntries.length > 0 ? (
        <div className="space-y-3">
          {areaEntries.map(([key, data]) => (
            <AreaCard key={key} areaKey={key} data={data} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Henüz sonuç verisi yok.</p>
      )}
    </div>
  )
}
