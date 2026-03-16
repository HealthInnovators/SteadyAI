import Link from 'next/link';

const sections = [
  {
    title: 'What We Collect',
    body:
      'GoodHealth247 and SteadyAI collect the account details, coaching inputs, workout logs, nutrition logs, and community content you choose to provide. If you enable optional tracking features, we may also collect device-level context such as health summary sync, location, motion, notification consent state, and related activity metadata.'
  },
  {
    title: 'How We Use Data',
    body:
      'We use your data to deliver personalized coaching, generate workout and nutrition guidance, save progress, power reports, and support community participation. Data is used to respond to the actions you explicitly request inside the app and connected ChatGPT experience.'
  },
  {
    title: 'Consent And Control',
    body:
      'Health sync, browser/device signals, and similar sensitive inputs are intended to be consent-based features. You can choose whether to enable those capabilities, and your access to core app features does not require every optional permission.'
  },
  {
    title: 'Third-Party Services',
    body:
      'The product may use infrastructure and AI providers such as Supabase for authentication and storage, and model providers for generating coaching responses. When those providers are used, data is processed only to support the requested product functionality.'
  },
  {
    title: 'Storage And Security',
    body:
      'We store application data in managed infrastructure and limit access to operational needs. No system can promise absolute security, but we aim to minimize data exposure and use standard access controls for hosted services.'
  },
  {
    title: 'Your Choices',
    body:
      'You can request updates to your account information, stop using optional tracking features, or ask for account/data deletion subject to operational and legal requirements. Contact the GoodHealth247 team for privacy-related requests.'
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,240,220,0.95),_rgba(246,236,226,0.88)_38%,_rgba(244,239,232,1)_100%)] px-4 py-10 text-[#1d140d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(80,48,24,0.08)] backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a4b28]">GoodHealth247</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f5145]">
            This page explains, at a high level, how GoodHealth247 and SteadyAI handle account, coaching, tracking, and community data across the website and connected ChatGPT experience.
          </p>
          <p className="mt-3 text-sm text-[#77685d]">Last updated: March 16, 2026</p>

          <div className="mt-8 space-y-5">
            {sections.map((section) => (
              <section key={section.title} className="rounded-[28px] border border-[#ead9ca] bg-[#fffaf5] p-5">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#5f5145]">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#ead9ca] bg-[#fcf5ec] px-5 py-4">
            <p className="text-sm text-[#5f5145]">Questions or requests about privacy can be directed to the GoodHealth247 support team.</p>
            <Link href="/" className="font-medium text-[#7a4b28] underline-offset-4 hover:underline">
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
