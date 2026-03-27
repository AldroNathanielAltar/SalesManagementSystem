import { useParams } from 'react-router-dom'

export default function SalesDetailPage() {
  const { transNo } = useParams()
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Transaction: {transNo}</h2>
        <p className="text-gray-400">Full implementation in Sprint 2 — M2</p>
      </div>
    </div>
  )
}