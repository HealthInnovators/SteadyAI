import Link from 'next/link';

const sections = [
  {
    title: 'Acceptance Of Terms',
    body:
      'By accessing or using GoodHealth247 and SteadyAI, you agree to these Terms of Service. If you do not agree, do not use the website, mobile experiences, or connected ChatGPT features.'
  },
  {
    title: 'Informational Use',
    body:
      'SteadyAI provides general fitness, nutrition, coaching, and engagement support. It is not a substitute for licensed medical advice, diagnosis, or treatment. Users should seek qualified professional care for medical concerns.'
  },
  {
    title: 'Account Responsibilities',
    body:
      'You are responsible for maintaining the confidentiality of your account credentials and for activity that occurs under your account. You agree to provide accurate information and to avoid impersonation or misuse of the service.'
  },
  {
    title: 'Acceptable Use',
    body:
      'You agree not to misuse the platform, interfere with service operation, attempt unauthorized access, or post unlawful, abusive, or harmful content. GoodHealth247 may limit or suspend access for misuse or policy violations.'
  },
  {
    title: 'User Content',
    body:
      'You retain responsibility for the text, logs, posts, and other content you submit. By using the service, you grant GoodHealth247 the rights needed to store, display, and process that content for product operation and support.'
  },
  {
    title: 'Service Availability',
    body:
      'We may change, improve, suspend, or discontinue features at any time. We do not guarantee uninterrupted availability, permanent feature support, or error-free operation across all clients and integrations.'
  },
  {
    title: 'Limitation Of Liability',
    body:
      'To the maximum extent permitted by law, GoodHealth247 is not liable for indirect, incidental, special, or consequential damages arising from use of the service. Use the platform at your own discretion and risk.'
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,240,220,0.95),_rgba(246,236,226,0.88)_38%,_rgba(244,239,232,1)_100%)] px-4 py-10 text-[#1d140d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(80,48,24,0.08)] backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a4b28]">GoodHealth247</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f5145]">
            These terms govern use of the GoodHealth247 website, SteadyAI application features, and connected assistant experiences.
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
            <p className="text-sm text-[#5f5145]">If you do not agree to these terms, discontinue use of the service.</p>
            <Link href="/" className="font-medium text-[#7a4b28] underline-offset-4 hover:underline">
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
