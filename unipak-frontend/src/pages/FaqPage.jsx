import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';
import GradientText from '../components/ui/GradientText';

const FAQS = [
  {
    question: 'Where does UniPak get its university information?',
    answer: (
      <p>
        UniPak organizes admission, program, test, fee, hostel, and merit information stored in its university database. Requirements can change, so confirm final dates and eligibility details with the university’s official admissions office.
      </p>
    ),
  },
  {
    question: 'How does the aggregate calculator work?',
    answer: (
      <p>
        The calculator applies the selected faculty’s recorded admission formula to your matric, intermediate, and accepted entry-test scores. Start on the <Link to="/calculator" className="font-semibold text-indigo-500 hover:underline">Aggregate Calculator</Link> and choose the exact faculty you plan to apply to.
      </p>
    ),
  },
  {
    question: 'Does a prediction guarantee admission?',
    answer: (
      <p>
        No. Prediction compares your calculated aggregate with available historical merit records. Cutoffs, seat counts, quotas, and selection policies may change each cycle, so treat the result as planning guidance only.
      </p>
    ),
  },
  {
    question: 'Where are my saved universities and results stored?',
    answer: (
      <p>
        Bookmarks, calculator results, and appearance preferences are stored locally in your browser. They are not an application submission and may disappear if you clear the browser’s site data.
      </p>
    ),
  },
  {
    question: 'How can I compare entry tests and accepted tests?',
    answer: (
      <p>
        Use the <Link to="/test-breakdowns" className="font-semibold text-indigo-500 hover:underline">Test Breakdown</Link> for subjects and formats, then open a university from <Link to="/explore" className="font-semibold text-indigo-500 hover:underline">Explore Universities</Link> to review its faculty-specific admission methods.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="page-container max-w-4xl">
      <div className="mb-10 text-center">
        <HelpCircle className="mx-auto mb-4 h-9 w-9 text-indigo-500" />
        <h1 className="page-heading mb-3"><GradientText>Frequently Asked Questions</GradientText></h1>
        <p className="page-copy mx-auto">Five quick answers for planning your university applications with UniPak.</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((item) => (
          <details key={item.question} className="group rounded-xl border border-slate-300 bg-white/70 dark:border-slate-800 dark:bg-slate-900/55">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 font-semibold text-slate-950 marker:hidden dark:text-slate-100">
              {item.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-indigo-500 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-slate-200 px-5 py-4 leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
