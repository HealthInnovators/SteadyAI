import Link from 'next/link';

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,240,220,0.95),_rgba(246,236,226,0.88)_38%,_rgba(244,239,232,1)_100%)] text-[#1d140d]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-white/70 bg-white/72 p-6 text-center shadow-[0_30px_120px_rgba(80,48,24,0.1)] backdrop-blur">
          <h1 className="mt-4 max-w-3xl mx-auto text-4xl font-semibold leading-tight sm:text-5xl">
            Welcome to SteadyAI
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-[#5f5145]">
            Your personal guide to fitness, nutrition, and well-being. Sign in to access your personalized dashboard and coaching tools.
          </p>
          <div className="mt-6">
            <Link
              href="/sign-in"
              className="inline-flex rounded-full bg-[#1d140d] px-8 py-3 text-sm font-medium text-white"
            >
              Sign In or Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
