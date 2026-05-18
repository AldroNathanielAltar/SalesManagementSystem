// Displays the full list of customers from the customer table
// Data is fetched via getCustomers() from lookupService.js
// Accessible to all authenticated users regardless of role
export default function LookupCustomersPage() {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Customers</h2>
        <p className="text-gray-400">Read-only lookup — Sprint 2 — M2</p>
      </div>
    </div>
  )
}