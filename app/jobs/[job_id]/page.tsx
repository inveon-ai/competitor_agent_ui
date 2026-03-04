import JobPoller from '@/components/JobPoller'

export default async function JobPage({
  params,
  searchParams,
}: {
  params: Promise<{ job_id: string }>
  searchParams: Promise<{ aid?: string }>
}) {
  const { job_id } = await params
  const { aid } = await searchParams

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Analiz İlerleyişi</h2>
        <p className="text-gray-400 text-sm">Her 3 saniyede otomatik güncelleniyor.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <JobPoller jobId={job_id} analysisId={aid} />
      </div>
    </div>
  )
}
