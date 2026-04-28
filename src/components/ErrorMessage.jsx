// ErrorMessage — shown when a data fetch fails
export default function ErrorMessage({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 text-center max-w-md">
        <p className="text-red-600 font-medium mb-1">Error</p>
        <p className="text-red-500 text-sm">{message}</p>
      </div>
    </div>
  )
}