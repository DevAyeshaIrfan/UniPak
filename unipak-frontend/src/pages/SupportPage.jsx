import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AtSign, Bug, CheckCircle2, Lightbulb, Mail, MessageCircle, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GradientText from '../components/ui/GradientText';
import { cn } from '../lib/utils';
import { submitSupportRequest } from '../api/support';

const REQUEST_TYPES = [
  {
    id: 'contact',
    label: 'Contact Us',
    description: 'Ask a question about UniPak or its university information.',
    icon: MessageCircle,
  },
  {
    id: 'bug',
    label: 'Report a Bug',
    description: 'Tell us what happened and which page you were using.',
    icon: Bug,
  },
  {
    id: 'feature',
    label: 'Request Feature',
    description: 'Suggest an improvement for planning university admissions.',
    icon: Lightbulb,
  },
];

function normalizeType(value) {
  return REQUEST_TYPES.some((type) => type.id === value) ? value : 'contact';
}

export default function SupportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requestType, setRequestType] = useState(() => normalizeType(searchParams.get('type')));
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const selectType = (type) => {
    setRequestType(type);
    setSearchParams({ type }, { replace: true });
    setConfirmation(null);
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Enter your name';
    if (!/^\S[^@\s]*@\S[^.\s]*\.\S+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address';
    if (!form.subject.trim()) nextErrors.subject = 'Add a short subject';
    if (form.message.trim().length < 10) nextErrors.message = 'Enter at least 10 characters';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setConfirmation(null);
      return;
    }

    const request = {
      requestType,
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await submitSupportRequest(request);
      setConfirmation({ id: response.referenceCode, emailStatus: response.email?.status });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setErrors({ form: error.response?.data?.error || 'The request could not be submitted. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-5xl">
      <div className="mb-10 text-center">
        <p className="section-kicker">UniPak support desk</p>
        <h1 className="page-heading mt-4 mb-3"><GradientText>How can we help?</GradientText></h1>
        <p className="page-copy mx-auto">Choose the kind of request you want to record, then give us the details needed to understand it.</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3" aria-label="Request type">
        {REQUEST_TYPES.map(({ id, label, description, icon: Icon }) => {
          const selected = requestType === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectType(id)}
              aria-pressed={selected}
              className={cn(
                'rounded-lg border p-5 text-left transition-[border-color,background-color,transform] hover:-translate-y-0.5',
                selected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/45'
                  : 'border-slate-300 bg-slate-50 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700'
              )}
            >
              <Icon className={cn('mb-4 h-6 w-6', selected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500')} />
              <span className="block font-semibold text-slate-950 dark:text-slate-100">{label}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</span>
            </button>
          );
        })}
      </div>

      {requestType === 'contact' && (
        <div className="mb-8 rounded-xl border border-slate-300 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Direct contact</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <a
              href="mailto:unipakapp@outlook.com"
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/35"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <Mail className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-950 dark:text-slate-100">Email</span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">unipakapp@outlook.com</span>
              </span>
            </a>
            <a
              href="https://www.instagram.com/unipak.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/35"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <AtSign className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-950 dark:text-slate-100">Instagram</span>
                <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">@unipak.app</span>
              </span>
            </a>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-300 bg-slate-50 p-5 shadow-[var(--shadow-soft)] sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        {confirmation ? (
          <div className="py-10 text-center" aria-live="polite">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Request saved</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
              Your request is stored in the UniPak database
              {confirmation.emailStatus === 'sent' && ' and the support inbox has been notified'}
              {confirmation.emailStatus === 'not_configured' && '. Email notification is waiting for inbox configuration'}
              {confirmation.emailStatus === 'failed' && ', but the email notification could not be delivered'}.
              {' '}Reference: <span className="font-mono font-semibold text-indigo-500">{confirmation.id}</span>
            </p>
            <Button className="mt-6" onClick={() => setConfirmation(null)}>Create another request</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Selected request</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-100">
                  {REQUEST_TYPES.find((type) => type.id === requestType)?.label}
                </h2>
              </div>
              <span className="rounded-full bg-slate-200 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">Database request</span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input id="support-name" name="name" label="Name *" value={form.name} onChange={updateField} error={errors.name} autoComplete="name" />
              <Input id="support-email" name="email" type="email" label="Email *" value={form.email} onChange={updateField} error={errors.email} autoComplete="email" />
            </div>

            <div className="mt-5">
              <Input id="support-subject" name="subject" label="Subject *" value={form.subject} onChange={updateField} error={errors.subject} placeholder="A short summary of your request" />
            </div>

            <div className="mt-5">
              <label htmlFor="support-message" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Message *</label>
              <textarea
                id="support-message"
                name="message"
                rows={7}
                value={form.message}
                onChange={updateField}
                placeholder={requestType === 'bug' ? 'What happened, what did you expect, and which page were you using?' : 'Add the details that will help us understand your request.'}
                className={cn(
                  'w-full resize-y rounded-md border bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/15 dark:bg-slate-950 dark:text-slate-100',
                  errors.message ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500 dark:border-slate-700'
                )}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'support-message-error' : undefined}
              />
              {errors.message && <p id="support-message-error" className="mt-2 text-sm text-red-500">{errors.message}</p>}
            </div>

            {errors.form && <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500" role="alert">{errors.form}</p>}

            <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center dark:border-slate-800">
              <p className="max-w-xl text-xs leading-5 text-slate-500">Submitted requests are stored in the UniPak database and sent to the configured support inbox.</p>
              <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="h-4 w-4" />} className="w-full sm:w-auto">Submit request</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
