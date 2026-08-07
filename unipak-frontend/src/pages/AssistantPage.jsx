import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BarChart3, Bot, Calculator, Compass, LoaderCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendChatMessage } from '../api/chat';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GradientText from '../components/ui/GradientText';
import MeritStamp from '../components/ui/MeritStamp';

const quickActions = [
  { label: 'Explore universities', to: '/explore', icon: Compass },
  { label: 'Calculate my aggregate', to: '/calculator', icon: Calculator },
  { label: 'Compare two programs', to: '/prediction', icon: BarChart3 },
];

const suggestedPrompts = [
  'Which universities accept NAT for computer science?',
  'Help me calculate a NUST aggregate',
  'Compare CS at FAST and COMSATS',
  'Show me the subjects in common entry tests',
];

const welcomeMessage = {
  role: 'assistant',
  text: 'Hi — I’m the UniPak admissions assistant. Ask me about programs, entry tests, aggregates, merit cutoffs, fees, hostels, or any UniPak feature.',
};

export default function AssistantPage() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isSending]);

  const send = async () => {
    const question = draft.trim();
    if (!question || isSending) return;

    const history = messages.map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, { role: 'user', text: question }]);
    setDraft('');
    setError('');
    setIsSending(true);

    try {
      const response = await sendChatMessage({ message: question, history });
      setMessages((current) => [...current, { role: 'assistant', text: response.reply }]);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'The assistant could not respond. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Bot /></div>
          <h1 className="page-heading">UniPak <GradientText>Assistant</GradientText></h1>
          <p className="page-copy mx-auto mt-3">Fast AI-powered admissions guidance.</p>
        </div>

        <Card className="overflow-hidden">
          <div className="max-h-[520px] min-h-80 space-y-4 overflow-y-auto p-6" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  {message.role === 'assistant' && /\b(likely|possible|unlikely)\b/i.test(message.text) && <MeritStamp status={message.text.match(/\b(likely|possible|unlikely)\b/i)?.[0]} size="sm" className="mb-3" />}
                  <p className={`whitespace-pre-wrap rounded-md border px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'border-indigo-500 bg-indigo-600 text-[#F3EAD8]' : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'}`}>{message.text}</p>
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="border-t border-slate-300 pt-5 dark:border-slate-800">
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Suggested UniPak actions</p>
                <div className="flex flex-wrap gap-2">{suggestedPrompts.map((prompt) => <button key={prompt} onClick={() => setDraft(prompt)} className="rounded-md border border-slate-300 bg-transparent px-3 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-indigo-950/35">{prompt}</button>)}</div>
              </div>
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Assistant is thinking…
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
                <AlertTriangle className="mr-2 mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about universities, tests, programs, or admission…"
                rows={1}
                maxLength={3000}
                disabled={isSending}
                className="min-h-12 min-w-0 flex-1 resize-none rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950"
              />
              <Button onClick={send} disabled={!draft.trim() || isSending} aria-label="Send message">
                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Press Enter to send. Shift + Enter adds a new line.</p>
          </div>
        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link key={to} to={to}>
              <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:border-indigo-300">
                <Icon className="mb-2 h-5 w-5 text-indigo-500" />
                <p className="text-sm font-semibold">{label}</p>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">AI responses can be inaccurate. Confirm final admission details with the university.</p>
      </div>
    </div>
  );
}
