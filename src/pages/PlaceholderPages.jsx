// ── Reusable placeholder ─────────────────────────────────
function PlaceholderPage({ title, icon, description }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">This page will be built in the next sprint.</p>
      </div>
    </div>
  )
}

export function TransactionsPage() {
  return <PlaceholderPage title="Transactions"  icon="🧾" description="View and manage all sales transactions."/>
}
export function CustomersPage() {
  return <PlaceholderPage title="Customers"     icon="👥" description="Manage your customer records."/>
}
export function EmployeesPage() {
  return <PlaceholderPage title="Employees"     icon="🏢" description="Manage employee accounts and roles."/>
}
export function ProductsPage() {
  return <PlaceholderPage title="Products"      icon="📦" description="Manage your product catalogue."/>
}
export function PricesPage() {
  return <PlaceholderPage title="Prices"        icon="💲" description="Set and manage product pricing."/>
}
export function ReportsPage() {
  return <PlaceholderPage title="Reports"       icon="📊" description="View sales and performance reports."/>
}
export function AdminPage() {
  return <PlaceholderPage title="Admin"         icon="⚙️" description="System administration and configuration."/>
}
export function DeletedItemsPage() {
  return <PlaceholderPage title="Deleted Items" icon="🗑️" description="Review and restore recently deleted records."/>
}
