import { Component } from 'react'

// ErrorBoundary — catches unexpected React rendering errors
// Wrap any page or component tree to prevent full app crash
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white border border-red-200 rounded-lg px-8 py-6 text-center max-w-md shadow">
            <h2 className="text-red-600 font-semibold text-lg mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}