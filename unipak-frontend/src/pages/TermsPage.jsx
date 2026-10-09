import { FileText } from 'lucide-react';
import GradientText from '../components/ui/GradientText';

const SECTIONS = [
  {
    title: 'Using UniPak',
    body: 'By using UniPak, you agree to use the website lawfully and only for personal university-admission research and planning. If you do not agree with these terms, please stop using the service.',
  },
  {
    title: 'Planning information only',
    body: 'UniPak provides general university, program, entry-test, aggregate, fee, hostel, merit, and admission-planning information. It does not represent a university and does not guarantee admission, eligibility, fees, deadlines, or merit outcomes.',
  },
  {
    title: 'Check official sources',
    body: 'University requirements and figures can change. You are responsible for confirming important details with the relevant university or official admissions office before applying or making a decision.',
  },
  {
    title: 'Calculations and AI responses',
    body: 'Calculator, prediction, and AI Assistant results are estimates based on the information provided and the data available to UniPak. They should not be treated as professional, academic, financial, or legal advice.',
  },
  {
    title: 'Acceptable use',
    body: 'You must not misuse the website, attempt unauthorized access, interfere with its operation, submit harmful content, impersonate another person, or use automated methods that place an unreasonable load on the service.',
  },
  {
    title: 'External services',
    body: 'UniPak may link to university websites, maps, and other third-party services. Those services are controlled by their respective providers and may have separate terms and privacy practices.',
  },
  {
    title: 'Availability and liability',
    body: 'UniPak may change, suspend, or discontinue features without notice. To the extent permitted by law, UniPak is not liable for losses caused by reliance on estimates, outdated third-party information, service interruptions, or external websites.',
  },
  {
    title: 'Changes and contact',
    body: 'These terms may be updated as UniPak develops. Continued use after an update means you accept the revised terms. Questions about these terms can be sent through the Contact Us page.',
  },
];

export default function TermsPage() {
  return (
    <div className="page-container max-w-4xl">
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <FileText className="h-9 w-9 text-indigo-500" />
          <h1 className="page-heading"><GradientText>Terms of Service</GradientText></h1>
        </div>
        <p className="page-copy">The general terms for using UniPak. Last updated August 12, 2026.</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-300 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/55">
            <h2 className="mb-2 text-xl font-semibold text-slate-950 dark:text-slate-100">{section.title}</h2>
            <p className="leading-7 text-slate-600 dark:text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
