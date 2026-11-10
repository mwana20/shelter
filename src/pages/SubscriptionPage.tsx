import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Clock3, CreditCard, LoaderCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getMySubscription,
  getSubscriptionPlans,
  getSubscriptionQuote,
  selectSubscriptionPlan,
  SubscriptionPlanCatalog,
  SubscriptionQuote,
  UserSubscriptionSummary
} from '../services/subscriptionApi';

const formatCurrency = (amount: number | string, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not started';

const displayLimit = (limit: number, item: string) => limit === 0 ? `Unlimited ${item}` : `${limit} ${item}${limit === 1 ? '' : 's'}`;

export const SubscriptionPage: React.FC = () => {
  const { currentUser, isAuthenticated, setCurrentPage, showNotification } = useApp();
  const [plans, setPlans] = useState<SubscriptionPlanCatalog | null>(null);
  const [quote, setQuote] = useState<SubscriptionQuote | null>(null);
  const [subscription, setSubscription] = useState<UserSubscriptionSummary | null>(null);
  const [durationMonths, setDurationMonths] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');

  const paymentResult = useMemo(() => {
    const hashQuery = window.location.hash.split('?')[1] || '';
    return new URLSearchParams(window.location.search).get('payment')
      || new URLSearchParams(hashQuery).get('payment');
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      getSubscriptionPlans(),
      isAuthenticated ? getMySubscription() : Promise.resolve(null)
    ]).then(([catalog, current]) => {
      if (!active) return;
      setPlans(catalog);
      setSubscription(current);
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load subscription options.');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    setQuote(null);
    if (!plans || Number(plans.paid.baseMonthlyPrice) <= 0) {
      return;
    }
    let active = true;
    getSubscriptionQuote(durationMonths).then((result) => {
      if (active) setQuote(result);
    }).catch((quoteError: unknown) => {
      if (active) setError(quoteError instanceof Error ? quoteError.message : 'Unable to calculate this plan price.');
    });
    return () => { active = false; };
  }, [durationMonths, plans]);

  useEffect(() => {
    if (paymentResult === 'cancelled') {
      setPaymentNotice('Checkout was cancelled. No paid plan was activated; you can choose a plan and try again.');
      return;
    }
    if (paymentResult !== 'success' || !isAuthenticated) return;

    let active = true;
    let timeout: number | undefined;
    let attempts = 0;
    const checkPayment = async () => {
      try {
        const current = await getMySubscription();
        if (!active) return;
        setSubscription(current);
        if (current.current?.plan === 'PAID' && current.current.status === 'ACTIVE') {
          setPaymentNotice('Payment verified. Your Paid Plan is active.');
          return;
        }
      } catch {
        if (!active) return;
      }
      attempts += 1;
      if (active && attempts < 12) timeout = window.setTimeout(checkPayment, 2500);
      else if (active) setPaymentNotice('Payment confirmation is still pending. Your plan will activate as soon as Stripe confirms it.');
    };
    void checkPayment();
    return () => {
      active = false;
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [isAuthenticated, paymentResult]);

  const choosePlan = async (plan: 'FREE' | 'PAID') => {
    if (!isAuthenticated) {
      sessionStorage.setItem('shelter_return_after_subscription_signin', '1');
      setCurrentPage('sign-in');
      return;
    }
    if (currentUser.role !== 'owner' && currentUser.role !== 'agent') {
      showNotification('Create or sign in to a Property Owner or Broker account to subscribe.', 'info');
      setCurrentPage('create-account');
      return;
    }

    setError('');
    setIsSelecting(true);
    try {
      const result = await selectSubscriptionPlan(plan, plan === 'PAID' ? durationMonths : undefined);
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      setSubscription(await getMySubscription());
      showNotification(result.alreadyActive ? 'Your Free Plan is already active.' : 'Free Plan activated successfully.', 'success');
      setCurrentPage('seller-dashboard');
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : 'Unable to select this subscription.');
    } finally {
      setIsSelecting(false);
    }
  };

  const current = subscription?.current;
  const durationLabel = (months: number) => {
    const years = Math.floor(months / 12);
    const remainder = months % 12;
    return [
      years ? `${years} ${years === 1 ? 'year' : 'years'}` : '',
      remainder ? `${remainder} ${remainder === 1 ? 'month' : 'months'}` : ''
    ].filter(Boolean).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3 text-sm text-slate-600">
        <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
        Loading subscription options...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Shelter membership</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Choose the plan that fits your property business
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Compare plans before you commit. Start free, or choose any paid duration from one to 48 months.
            Paid access begins only after payment is verified.
          </p>
        </header>

        {error && (
          <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
            {error}
          </div>
        )}
        {paymentNotice && (
          <div className="mx-auto mt-6 flex max-w-3xl items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900" role="status">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            {paymentNotice}
          </div>
        )}

        {current && (
          <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Current subscription</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{current.plan} Plan · {current.status}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Active since {formatDate(current.startsAt)} · expires {formatDate(current.expiresAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage('seller-dashboard')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {plans && (
          <>
            <section className="mt-10 grid gap-5 lg:grid-cols-2" aria-label="Subscription plans">
              <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">Free Plan</h2>
                    <p className="mt-1 text-sm text-slate-600">Get started and verify your first listing.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">No payment</span>
                </div>
                <p className="mt-6 text-4xl font-extrabold text-slate-950">Free</p>
                <p className="mt-1 text-sm text-slate-500">Valid for {plans.free.validityDays} days</p>
                <ul className="mt-7 flex-1 space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{displayLimit(plans.free.listingLimit, 'active listing')}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{displayLimit(plans.free.mapUnlockLimit, 'map unlock')}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" />One-time activation with no recurring charge</li>
                  <li className="flex gap-2"><Clock3 className="h-4 w-4 shrink-0 text-emerald-600" />Subscription expiry shown in your dashboard</li>
                </ul>
                <button
                  type="button"
                  disabled={isSelecting || current?.plan === 'FREE'}
                  onClick={() => void choosePlan('FREE')}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {current?.plan === 'FREE' ? 'Free Plan active' : 'Choose Free Plan'}
                  {isSelecting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                </button>
              </article>

              <article className="relative flex flex-col rounded-3xl border border-emerald-700 bg-white p-6 shadow-lg shadow-emerald-900/10 sm:p-8">
                <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                  <Sparkles className="h-3.5 w-3.5" /> More flexibility
                </div>
                <div className="pr-28">
                  <h2 className="text-2xl font-bold text-slate-950">Paid Plan</h2>
                  <p className="mt-1 text-sm text-slate-600">Choose a duration and save more on longer terms.</p>
                </div>
                {Number(plans.paid.baseMonthlyPrice) > 0 && quote?.durationMonths === durationMonths ? (
                  <>
                    <div className="mt-6 flex items-end gap-2">
                      <p className="text-4xl font-extrabold text-slate-950">{formatCurrency(quote.effectiveMonthlyCost, quote.currency)}</p>
                      <span className="pb-1 text-sm text-slate-500">/ effective month</span>
                    </div>
                    <label className="mt-6 block text-sm font-semibold text-slate-800" htmlFor="subscription-duration">
                      Subscription duration
                    </label>
                    <select
                      id="subscription-duration"
                      value={durationMonths}
                      onChange={(event) => setDurationMonths(Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                      {Array.from({ length: 48 }, (_, index) => index + 1).map((months) => (
                        <option key={months} value={months}>{durationLabel(months)}</option>
                      ))}
                    </select>
                    <dl className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">Original total</dt><dd className="font-semibold">{formatCurrency(quote.originalTotal, quote.currency)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">Discount ({Number(quote.discountPercent)}%)</dt><dd className="font-semibold text-emerald-700">−{formatCurrency(quote.discountAmount, quote.currency)}</dd></div>
                      <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 font-bold"><dt>Pay today</dt><dd>{formatCurrency(quote.totalAmount, quote.currency)}</dd></div>
                      <div className="flex justify-between gap-3 text-emerald-800"><dt>Total savings</dt><dd className="font-semibold">{formatCurrency(quote.savings, quote.currency)}</dd></div>
                    </dl>
                  </>
                ) : (
                  <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Paid pricing is being configured by Shelter. You can compare the plan now and start with Free.
                  </div>
                )}
                <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{displayLimit(plans.paid.listingLimit, 'active listing')}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{displayLimit(plans.paid.mapUnlockLimit, 'map unlock')}</li>
                  <li className="flex gap-2"><CreditCard className="h-4 w-4 shrink-0 text-emerald-600" />One-time secure checkout; no automatic renewal</li>
                </ul>
                <button
                  type="button"
                  disabled={isSelecting || !quote || quote.durationMonths !== durationMonths}
                  onClick={() => void choosePlan('PAID')}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to secure payment
                  {isSelecting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </article>
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h2 className="px-5 py-4 text-lg font-bold text-slate-950">Plan comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-5 py-3">Feature</th><th className="px-5 py-3">Free Plan</th><th className="px-5 py-3">Paid Plan</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr><th className="px-5 py-3 font-semibold">Listing limit</th><td className="px-5 py-3">{displayLimit(plans.free.listingLimit, 'listing')}</td><td className="px-5 py-3">{displayLimit(plans.paid.listingLimit, 'listing')}</td></tr>
                    <tr><th className="px-5 py-3 font-semibold">Map access</th><td className="px-5 py-3">{displayLimit(plans.free.mapUnlockLimit, 'map')}</td><td className="px-5 py-3">{displayLimit(plans.paid.mapUnlockLimit, 'map')}</td></tr>
                    <tr><th className="px-5 py-3 font-semibold">Validity</th><td className="px-5 py-3">{plans.free.validityDays} days</td><td className="px-5 py-3">1–48 months</td></tr>
                    <tr><th className="px-5 py-3 font-semibold">Long-term discounts</th><td className="px-5 py-3">—</td><td className="px-5 py-3">{plans.paid.discounts.map((item) => `${item.minMonths}–${item.maxMonths} months: ${Number(item.discountPercent)}%`).join(' · ')}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {subscription?.history.length ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950">Subscription and payment history</h2>
              <button type="button" onClick={() => void getMySubscription().then(setSubscription)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {subscription.history.map((item) => (
                <li key={item.id} className="flex flex-col justify-between gap-2 py-3 text-sm sm:flex-row sm:items-center">
                  <span className="font-semibold text-slate-800">{item.plan} · {item.status} · {formatDate(item.startsAt)} – {formatDate(item.expiresAt)}</span>
                  <span className="text-slate-600">{item.payments.map((payment) => `${payment.status} · ${formatCurrency(payment.amount, payment.currency)}`).join(', ') || 'No payment required'}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
};
