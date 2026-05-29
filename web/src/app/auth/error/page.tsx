export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Sign-in failed</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Something went wrong during LinkedIn sign-in. Please try again.
        </p>
        <a
          href="/join"
          className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Try again
        </a>
      </div>
    </main>
  )
}
