import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Steady AI',
  description:
    'Privacy Policy for GoodHealth247 and Steady AI covering collected data, purposes, recipients, retention, and user controls.'
};

const policySections: Array<{
  title: string;
  body?: string;
  bullets?: string[];
}> = [
  {
    title: 'Overview',
    body:
      'This Privacy Policy explains how GoodHealth247 and Steady AI collect, use, disclose, retain, and give users control over data processed through the website, mobile experiences, backend APIs, and connected ChatGPT integration.'
  },
  {
    title: 'Data We Collect',
    bullets: [
      'Account and identity data: email address, username, authentication identifiers, and session tokens used to sign in and keep an account active.',
      'Onboarding and profile data: primary goal, experience level, dietary preferences, time availability, onboarding completion status, and related profile settings.',
      'Coaching inputs and outputs: prompts entered into coaching tools, meal descriptions, workout requests, educator questions, generated plans, summaries, drafts, and follow-up actions.',
      'Workout and activity data: workout plans, completed exercises, session duration, feedback, workout preferences, challenge participation, check-in status, and workout history summaries.',
      'Nutrition data: meal text, analyzed food items, calories, macros, timestamps, optional uploaded nutrition images, and nutrition logging history.',
      'Community data: posts, replies, reactions, suggested post drafts, peer outreach suggestions, and moderation-relevant context needed to operate community features.',
      'Reports and engagement data: check-in counts, adherence rates, community engagement counts, report window metrics, and similar progress summaries.',
      'Store and transaction-related data: purchase history, purchased product identifiers, coach feedback requests, and recommendation inputs used to show optional offers.',
      'Notification and reminder data: notification preferences, timezone, reminder schedule settings, cooldown settings, delivery logs, and reply-notification events.',
      'Device, browser, and app context: timezone, language, platform, viewport, online status, connection type, likely mobile status, and other device snapshot fields shown in the product before or when the user asks to capture them.',
      'Optional location, motion, and notification-permission data: current location, motion permission status, and notification permission status when the user explicitly enables or requests those features.',
      'Optional health summary data: health summary sync inputs such as steps, activity minutes, date, source app, connection identifiers, and workout summary records when a user explicitly enables health sync or saves a workout session.',
      'Technical and security data: request metadata, bearer-token use, OAuth flow state, cookie/session state, and service logs needed to authenticate requests, prevent misuse, and maintain service reliability.'
    ]
  },
  {
    title: 'How We Use Data',
    bullets: [
      'To create and manage accounts, authenticate users, and keep sessions active across web, mobile, and connected ChatGPT experiences.',
      'To personalize coaching responses, including habit guidance, meal planning, workout coaching, educator help, and user summary generation.',
      'To save workouts, nutrition logs, community posts, check-ins, reports, and preferences at the user’s direction.',
      'To generate reports, adherence summaries, streaks, trend views, and progress insights.',
      'To deliver optional notifications and reminders that the user has chosen to receive.',
      'To operate community features, including displaying posts, reactions, replies, and check-in content to relevant users.',
      'To provide store recommendations, product suggestions, and coach support flows tied to user activity and profile context.',
      'To support connected ChatGPT tool use, including processing tool inputs and returning tool outputs and UI widgets requested by the user.',
      'To secure the service, troubleshoot issues, audit misuse, and maintain performance and reliability.'
    ]
  },
  {
    title: 'How ChatGPT-Connected Tools Use Data',
    bullets: [
      'When a user connects Steady AI to ChatGPT, tool inputs provided through ChatGPT are sent to Steady AI so the requested tool can run.',
      'Tool inputs may include profile data, coaching prompts, meal text, workout session details, community draft content, notification preferences, or an authenticated user identifier depending on the tool used.',
      'Tool outputs may include generated guidance, workout cards, nutrition summaries, user summaries, check-in drafts, and other structured results returned to ChatGPT for display to the user.',
      'Static widget resources used to render cards in ChatGPT do not by themselves contain personal data, but personalized tool calls can return user-linked content when the user is authenticated or provides a user identifier.',
      'If a tool performs a write action, such as logging nutrition, saving a workout session, updating workout preferences, or creating a community check-in post, the relevant submitted data is stored in the user account so the product can reflect that action later.'
    ]
  },
  {
    title: 'Disclosures And Recipients',
    bullets: [
      'Service providers and infrastructure vendors: we use hosted infrastructure and software providers to support authentication, databases, storage, hosting, and delivery of the application.',
      'Supabase and similar backend services may process account data, authentication tokens, database records, and stored content to provide sign-in, storage, and application functionality.',
      'AI model providers may process prompts and related context needed to generate requested coaching, nutrition, education, and community guidance outputs.',
      'Community recipients: when a user publishes a post, check-in, or reaction, that content is disclosed to other users who can access the relevant community surface.',
      'Legal or safety disclosures: we may disclose information when reasonably necessary to comply with law, enforce terms, protect users, or respond to valid legal process.',
      'Business transfers: data may be transferred as part of a merger, acquisition, financing, or sale of assets, subject to applicable law.'
    ]
  },
  {
    title: 'Data Retention',
    bullets: [
      'Account and profile records are retained while the account remains active and for a reasonable period afterward to support security, fraud prevention, and legal compliance.',
      'Coaching logs, workout data, nutrition logs, reports, challenge participation, store history, and community content are retained until deleted by the user, removed by the service, or no longer needed for product and legal purposes.',
      'Notification logs, security logs, and operational records may be kept for a limited period needed for reliability, troubleshooting, abuse prevention, and audit purposes.',
      'Temporary OAuth codes, sessions, and short-lived connection state are retained only for the duration needed to complete authentication and maintain secure access.',
      'Where deletion is requested, backups and residual copies may persist for a limited period before they are overwritten in the ordinary course of operations.'
    ]
  },
  {
    title: 'User Controls And Choices',
    bullets: [
      'Users can choose whether to enable optional health, location, motion, and notification-related features.',
      'Users can choose whether to connect Steady AI to ChatGPT and whether to authenticate a ChatGPT session against their account.',
      'Users can edit profile and onboarding information through product flows when available.',
      'Users can choose whether to create community posts, reactions, and check-ins; those features are not automatic.',
      'Users can change notification preferences and reminder schedules.',
      'Users can request account deletion or data deletion, subject to legal, security, and operational retention requirements.'
    ]
  },
  {
    title: 'Sensitive And Health-Related Data',
    bullets: [
      'Steady AI is designed so health summary sync and related device or sensor features are optional and user-initiated.',
      'When health-related data is used, it is used to provide the specific tracking, report, or coaching function requested by the user.',
      'Certain MCP summary flows are designed to avoid including raw health data where not needed and instead use reduced or summary-level inputs.'
    ]
  },
  {
    title: 'Cookies, Sessions, And Authentication',
    bullets: [
      'We use cookies, bearer tokens, session identifiers, and related authentication state to keep users signed in, support secure OAuth flows, and connect ChatGPT sessions to the correct account when authorized.',
      'These mechanisms are used for security and product operation and are not a promise that tracking technologies are limited only to advertising or analytics contexts.'
    ]
  },
  {
    title: 'Security',
    body:
      'We use administrative, technical, and organizational measures intended to protect data from unauthorized access, alteration, disclosure, or destruction. No method of storage or transmission is completely secure, so we cannot guarantee absolute security.'
  },
  {
    title: 'Children',
    body:
      'The service is not intended for children who are not legally permitted to use it under applicable law. If you believe a child provided personal data without proper authorization, contact the GoodHealth247 team so the issue can be reviewed.'
  },
  {
    title: 'Changes To This Policy',
    body:
      'We may update this Privacy Policy as the product changes. When we do, we will update the date on this page and publish the revised policy here.'
  }
];

const disclosureHighlights = [
  {
    label: 'Collected data',
    value: 'Account, profile, coaching prompts, nutrition logs, workout/session data, community content, device context, optional health and permission data.'
  },
  {
    label: 'Purposes',
    value: 'Authentication, personalized coaching, logging, reports, community features, store/support flows, and connected ChatGPT tool responses.'
  },
  {
    label: 'Recipients',
    value: 'Infrastructure vendors, authentication/storage providers, AI model providers, community viewers when you publish content, and legal/safety recipients when required.'
  },
  {
    label: 'Retention',
    value: 'Short-lived auth state is temporary; account, content, and activity records are retained while needed for product, security, and legal purposes.'
  },
  {
    label: 'User controls',
    value: 'Users control optional health, location, motion, notification, and ChatGPT connection features and may request access, correction, or deletion.'
  }
] as const;

const toolDisclosureRows = [
  {
    tool: 'steadyai.ask_agent',
    inputs: 'Coaching prompt and selected coaching mode such as habit reset, meal planning, or community guidance.',
    outputs: 'Generated coaching text and widget content.',
    notes: 'Prompt content may be processed by configured AI model providers to generate the requested response.'
  },
  {
    tool: 'steadyai.educator_help',
    inputs: 'User question, optional thread context, and optional community-post context.',
    outputs: 'Educational explanation or myth-correction response with educator widget content.',
    notes: 'Context is used only to answer the requested educational question.'
  },
  {
    tool: 'steadyai.workout_coach',
    inputs: 'Workout prompt plus authenticated user context, workout preferences, and recent workout summary when available.',
    outputs: 'Structured workout plan, exercise media/demo links, and workout widget data.',
    notes: 'If a signed-in user exists, recent workout history and preferences may be read to personalize the plan.'
  },
  {
    tool: 'steadyai.log_workout_session',
    inputs: 'User id or authenticated user, session id, completed exercise counts, duration, optional feedback, and optional workout plan payload.',
    outputs: 'Saved workout-session confirmation and record identifiers.',
    notes: 'This tool writes workout summary data to the user account.'
  },
  {
    tool: 'steadyai.get_current_user_context',
    inputs: 'Authenticated session state or provided user id.',
    outputs: 'Resolved user id and context source.',
    notes: 'This tool is used to determine which account later tool actions should reference.'
  },
  {
    tool: 'steadyai.generate_checkin_draft',
    inputs: 'Workout totals, completion counts, feedback, and optional weekly insight.',
    outputs: 'Draft CHECK_IN text and structured draft content.',
    notes: 'This tool does not publish community content by itself.'
  },
  {
    tool: 'steadyai.create_checkin_post',
    inputs: 'Authenticated user or provided user id plus check-in post content.',
    outputs: 'Created post id, timestamp, and stored post content summary.',
    notes: 'Published post content becomes visible to other users who can access the relevant community surface.'
  },
  {
    tool: 'steadyai.update_workout_preferences',
    inputs: 'Authenticated user or provided user id plus preference values such as preferred duration, impact, equipment, and auto-post settings.',
    outputs: 'Saved preference confirmation and updated preference values.',
    notes: 'This tool writes user preference data.'
  },
  {
    tool: 'steadyai.nutrition_coach',
    inputs: 'Meal text, optional nutrition action, and authenticated user context when available.',
    outputs: 'Estimated calories/macros, itemized analysis, tips, and nutrition widget data.',
    notes: 'Meal text may be processed by configured AI/nutrition estimation providers to return the requested estimate.'
  },
  {
    tool: 'steadyai.log_nutrition_intake',
    inputs: 'Authenticated user or provided user id, meal text, and optional consumed-at timestamp.',
    outputs: 'Saved nutrition entry id, totals, and updated same-day summary.',
    notes: 'This tool writes nutrition-log data to the user account.'
  }
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,240,220,0.95),_rgba(246,236,226,0.88)_38%,_rgba(244,239,232,1)_100%)] px-4 py-10 text-[#1d140d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(80,48,24,0.08)] backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a4b28]">GoodHealth247</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-4xl text-base leading-7 text-[#5f5145]">
            This Privacy Policy applies to the Steady AI website, application features, backend APIs, and connected
            ChatGPT experience. It is intended to clearly describe the categories of data processed, the purposes for
            that processing, who may receive the data, how long data may be retained, and what controls users have.
          </p>
          <p className="mt-3 text-sm text-[#77685d]">Last updated: April 4, 2026</p>

          <div className="mt-8 rounded-[28px] border border-[#ead9ca] bg-[#fffaf5] p-5">
            <h2 className="text-lg font-semibold">Quick Summary</h2>
            <p className="mt-2 text-sm leading-7 text-[#5f5145]">
              Steady AI processes account data, coaching inputs, fitness and nutrition logs, community content, reports,
              optional device and health data, and ChatGPT-connected tool inputs and outputs in order to operate the
              service requested by the user. Optional permissions and connected-account features are user-controlled.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {disclosureHighlights.map((item) => (
              <section key={item.label} className="rounded-[24px] border border-[#ead9ca] bg-[#fffaf5] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a4b28]">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#5f5145]">{item.value}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-[28px] border border-[#ead9ca] bg-[#fffaf5] p-5">
            <h2 className="text-lg font-semibold">ChatGPT Tool Data Disclosures</h2>
            <p className="mt-2 text-sm leading-7 text-[#5f5145]">
              The table below summarizes the major Steady AI MCP tools, the categories of data they use, the outputs
              they return, and whether those flows can write account or community data.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-[#5f5145]">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.18em] text-[#7a4b28]">
                    <th className="px-3">Tool</th>
                    <th className="px-3">Inputs Used</th>
                    <th className="px-3">Outputs Returned</th>
                    <th className="px-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {toolDisclosureRows.map((row) => (
                    <tr key={row.tool} className="align-top">
                      <td className="rounded-l-[18px] border border-[#ead9ca] bg-[#fcf5ec] px-3 py-3 font-semibold text-[#1d140d]">
                        {row.tool}
                      </td>
                      <td className="border-y border-[#ead9ca] bg-[#fcf5ec] px-3 py-3">{row.inputs}</td>
                      <td className="border-y border-[#ead9ca] bg-[#fcf5ec] px-3 py-3">{row.outputs}</td>
                      <td className="rounded-r-[18px] border border-[#ead9ca] bg-[#fcf5ec] px-3 py-3">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8 space-y-5">
            {policySections.map((section) => (
              <section key={section.title} className="rounded-[28px] border border-[#ead9ca] bg-[#fffaf5] p-5">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                {section.body ? <p className="mt-2 text-sm leading-7 text-[#5f5145]">{section.body}</p> : null}
                {section.bullets ? (
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5f5145]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7a4b28]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-[#ead9ca] bg-[#fcf5ec] p-5">
            <h2 className="text-lg font-semibold">Privacy Requests</h2>
            <p className="mt-2 text-sm leading-7 text-[#5f5145]">
              Questions or requests related to privacy, access, correction, deletion, or optional feature controls can
              be directed to the GoodHealth247 support team through the support channel provided with the service.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#ead9ca] bg-[#fcf5ec] px-5 py-4">
            <p className="text-sm text-[#5f5145]">Reviewers and users should rely on this page as the current privacy disclosure for Steady AI.</p>
            <Link href="/" className="font-medium text-[#7a4b28] underline-offset-4 hover:underline">
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
