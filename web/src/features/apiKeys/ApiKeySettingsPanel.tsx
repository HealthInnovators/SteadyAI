'use client';

export function ApiKeySettingsPanel() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-5 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">AI Provider Settings</h1>
        <p className="text-sm text-gray-600">
          Personal provider key entry is disabled. SteadyAI uses server-managed provider credentials.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-800">
          Google Gemini and Groq user API key input has been removed from this app.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          If you need provider changes, update backend environment variables and redeploy.
        </p>
      </section>
    </main>
  );
}

