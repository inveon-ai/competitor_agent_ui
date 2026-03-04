import AnalysisForm from '@/components/AnalysisForm'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1">Yeni Analiz</h2>
        <p className="text-gray-400 text-sm">Rakip şirketin URL&apos;sini girin ve analiz alanlarını seçin.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <AnalysisForm />
      </div>
    </div>
  )
}
