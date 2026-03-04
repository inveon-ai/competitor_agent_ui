import Link from 'next/link'
import { getResultDetail } from '@/lib/api'
import ResultViewer from '@/components/ResultViewer'

export default async function ResultPage({ params }: { params: Promise<{ analysis_id: string }> }) {
  const { analysis_id } = await params

  let result = null
  let error = null
  try {
    result = await getResultDetail(analysis_id)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Sonuç yüklenemedi'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Analiz Sonuçları</h2>
        <p className="text-gray-400 text-sm font-mono text-xs">{analysis_id}</p>
      </div>

      {error && (
        <div className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4">{error}</div>
      )}

      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <ResultViewer result={result} />
        </div>
      )}

      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">← Yeni Analiz</Link>
    </div>
  )
}
