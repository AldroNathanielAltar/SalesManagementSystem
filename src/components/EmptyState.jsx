// EmptyState — shown when a query returns no results
export default function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-center max-w-md">
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  )
}