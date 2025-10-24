export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold">Next.js App is Running</h1>
        <p className="text-gray-500 mt-2">Frontend and backend unified. Try the health endpoint below.</p>
        <a className="text-blue-600 underline mt-4 inline-block" href="/api/health">/api/health</a>
      </div>
    </main>
  );
}
