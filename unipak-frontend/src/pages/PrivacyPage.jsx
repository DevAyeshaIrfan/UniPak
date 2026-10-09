import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import GradientText from '../components/ui/GradientText';

const SECTIONS = [
  {
    title: 'Information stored on your device',
    body: 'UniPak stores saved universities, saved calculator results, and theme preferences in your browser’s local storage. This data remains on that browser unless you remove it or clear the site’s data.',
  },
  {
    title: 'University and calculator requests',
    body: 'When you browse universities or run a calculation, the app sends the requested filters, selected faculty, and marks to the UniPak backend so it can return database records and calculate a result.',
  },
  {
    title: 'Support requests',
    body: 'When you submit the support form, your request type, name, email address, subject, and message are sent to the UniPak backend, stored in its database, and forwarded to the configured support inbox.',
  },
  {
    title: 'AI Assistant messages',
    body: 'Messages and recent conversation context entered in the AI Assistant are sent through the UniPak backend to its configured AI provider to generate a reply. Do not enter passwords, identification numbers, payment details, or other sensitive information.',
  },
  {
    title: 'Data accuracy and external links',
    body: 'UniPak provides planning information and links to third-party university or map services. Those services have their own privacy practices, and final admission details should be confirmed with the relevant university.',
  },
  {
    title: 'Your choices',
    body: 'You can remove individual saved items from the Saved Items page or clear locally stored UniPak data from your browser. You can use the core university and calculator features without creating a user account.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="page-container max-w-4xl">
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <ShieldCheck className="h-9 w-9 text-indigo-500" />
          <h1 className="page-heading"><GradientText>Privacy Policy</GradientText></h1>
        </div>
        <p className="page-copy">How UniPak handles browser data and requests. Last updated August 12, 2026.</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-300 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/55">
            <h2 className="mb-2 text-xl font-semibold text-slate-950 dark:text-slate-100">{section.title}</h2>
            <p className="leading-7 text-slate-600 dark:text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm leading-6 text-slate-500">
        Need help understanding a feature? Visit the <Link to="/faq" className="font-semibold text-indigo-500 hover:underline">UniPak FAQ</Link> or use the <Link to="/ai" className="font-semibold text-indigo-500 hover:underline">AI Assistant</Link> without sharing sensitive personal data.
      </p>
    </div>
  );
}
