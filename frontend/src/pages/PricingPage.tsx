import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  CreditCard,
  Building2,
  HelpCircle,
  Loader2,
  CheckCircle2,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  UserCheck,
  Mail,
  User as UserIcon,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { subscriptionService } from '../services/api';
import { SubscriptionPlan, RazorpayConfig } from '../types';

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 0,
    price_yearly: 0,
    price_inr_monthly: 0,
    price_inr_yearly: 0,
    currency: 'USD',
    symbol: '$',
    symbol_inr: '₹',
    description: 'Essential career tools for individual job seekers and students.',
    badge: 'Forever Free',
    is_popular: false,
    features: [
      '3 Comprehensive ATS Resume Scans / month',
      'Basic Keyword & Skill Gap Analysis',
      'Curated Course Recommendations from Coursera/edX',
      'Standard AI Career Mentor (10 chats / day)',
      'Downloadable ATS Summary Report',
    ],
    limits: {
      ats_scans: 3,
      mentor_chats_daily: 10,
      roadmap_allowed: false,
      recruiter_access: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro Career',
    price_monthly: 19,
    price_yearly: 180,
    price_inr_monthly: 1499,
    price_inr_yearly: 14400,
    currency: 'USD',
    symbol: '$',
    symbol_inr: '₹',
    description: 'Full machine learning career intelligence suite for ambitious professionals.',
    badge: 'Most Popular',
    is_popular: true,
    features: [
      'Unlimited ATS Resume Scans & Instant Rescoring',
      'SBERT Dense Embedding Cosine Similarity Matching',
      'Random Forest Employability & Salary Predictions',
      'Full SHAP TreeExplainer Visual Interpretability',
      'Dynamic 12-Week Interactive Skill Roadmap',
      'Priority AI Mentor with Contextual Memory (Unlimited)',
      'Mock Interview Prep with AI Feedback',
      'Priority Support & Resume Version History',
    ],
    limits: {
      ats_scans: 999999,
      mentor_chats_daily: 999999,
      roadmap_allowed: true,
      recruiter_access: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise / Recruiter',
    price_monthly: 79,
    price_yearly: 780,
    price_inr_monthly: 5999,
    price_inr_yearly: 59999,
    currency: 'USD',
    symbol: '$',
    symbol_inr: '₹',
    description: 'Advanced candidate pipeline and hiring intelligence for recruiters & talent teams.',
    badge: 'For Teams',
    is_popular: false,
    features: [
      'Everything included in Pro Career',
      'Full Recruiter Dashboard & Candidate Pipeline',
      'Bulk Resume Parsing (Multi-file upload)',
      'Automated Candidate Ranking & ATS Benchmarking',
      'Candidate Status Workflow (Screening to Offered)',
      'Multi-Seat Access & Shared Candidate Notes',
      'Exportable CSV & Executive Candidate Reports',
      'Dedicated Account Manager & API Webhook Access',
    ],
    limits: {
      ats_scans: 999999,
      mentor_chats_daily: 999999,
      roadmap_allowed: true,
      recruiter_access: true,
    },
  },
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, setAuthSession } = useAuth();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);
  const [activeTier, setActiveTier] = useState<string>(user?.subscription_tier || 'starter');

  // Razorpay Gateway config
  const [razorpayConfig, setRazorpayConfig] = useState<RazorpayConfig | null>(null);

  // Checkout modal states
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'demo' | 'card'>('razorpay');
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string | null>(null);

  // Guest checkout inputs
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  // Cancel / Downgrade modal states
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionService.getPlans();
        if (data?.plans && data.plans.length > 0) {
          setPlans(data.plans);
        }
      } catch (err) {
        console.warn('Using default pricing plans:', err);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    const fetchStatus = async () => {
      try {
        const status = await subscriptionService.getStatus();
        if (status?.subscription_tier) {
          setActiveTier(status.subscription_tier);
          if (user && user.subscription_tier !== status.subscription_tier) {
            updateUser({ subscription_tier: status.subscription_tier });
          }
        }
      } catch (e) {
        console.warn('Could not fetch user subscription status:', e);
      }
    };

    const fetchRzpConfig = async () => {
      try {
        const cfg = await subscriptionService.getRazorpayConfig();
        setRazorpayConfig(cfg);
      } catch (e) {
        console.warn('Razorpay config endpoint unreachable:', e);
      }
    };

    fetchPlans();
    fetchStatus();
    fetchRzpConfig();
  }, [user]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === activeTier) {
      return;
    }
    // If currently on a paid tier and clicking starter, offer downgrade
    if (plan.id === 'starter' && activeTier !== 'starter') {
      setShowCancelModal(true);
      return;
    }

    setSelectedPlan(plan);
    setCheckoutSuccess(false);
    setErrorMessage(null);
    setRazorpayPaymentId(null);
  };

  // Launch Razorpay Checkout Popup
  const handleRazorpayCheckout = async () => {
    if (!selectedPlan) return;
    setIsCheckingOut(true);
    setErrorMessage(null);

    const email = user ? user.email : guestEmail.trim() || undefined;
    const name = user ? user.name : guestName.trim() || undefined;

    try {
      const order = await subscriptionService.createRazorpayOrder(
        selectedPlan.id,
        billingCycle,
        'INR',
        email,
        name
      );

      // Check if window.Razorpay SDK is available
      if (typeof (window as any).Razorpay === 'function') {
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'CareerIntel AI Platform',
          description: `${selectedPlan.name} Subscription (${billingCycle})`,
          image: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
          order_id: order.real_order_created ? order.order_id : undefined,
          prefill: {
            name: name || user?.name || 'Career Aspirant',
            email: email || user?.email || 'guest@careerintel.ai',
            contact: '9999999999',
          },
          theme: {
            color: '#0284c7',
          },
          handler: async function (response: any) {
            try {
              setIsCheckingOut(true);
              const verifyRes = await subscriptionService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id || order.order_id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'demo_signature',
                plan_id: selectedPlan.id,
                billing_cycle: billingCycle,
                email,
                name,
              });

              setActiveTier(selectedPlan.id);
              setCheckoutSuccess(true);
              setRazorpayPaymentId(response.razorpay_payment_id || verifyRes.payment_id || 'pay_verified');

              if (verifyRes.access_token && verifyRes.user) {
                setAuthSession(verifyRes.access_token, verifyRes.user);
              } else if (user) {
                updateUser({ subscription_tier: selectedPlan.id });
              }
            } catch (verErr: any) {
              console.error('Verification error:', verErr);
              setErrorMessage(verErr?.response?.data?.detail || 'Razorpay payment verification failed.');
            } finally {
              setIsCheckingOut(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsCheckingOut(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setErrorMessage(resp.error?.description || 'Payment was unsuccessful or cancelled.');
          setIsCheckingOut(false);
        });
        rzp.open();
      } else {
        // Fallback: Sandbox simulation if script was blocked by ad-blocker
        const verifyRes = await subscriptionService.verifyRazorpayPayment({
          razorpay_order_id: order.order_id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'demo_signature_fallback',
          plan_id: selectedPlan.id,
          billing_cycle: billingCycle,
          email,
          name,
        });

        setActiveTier(selectedPlan.id);
        setCheckoutSuccess(true);
        setRazorpayPaymentId(verifyRes.payment_id || 'pay_sim_complete');

        if (verifyRes.access_token && verifyRes.user) {
          setAuthSession(verifyRes.access_token, verifyRes.user);
        } else if (user) {
          updateUser({ subscription_tier: selectedPlan.id });
        }
      }
    } catch (err: any) {
      console.error('Razorpay Checkout error:', err);
      setErrorMessage(err?.response?.data?.detail || 'Unable to initiate Razorpay checkout. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Direct Sandbox / Card Confirmation
  const handleStandardCheckout = async () => {
    if (!selectedPlan) return;
    setIsCheckingOut(true);
    setErrorMessage(null);

    try {
      const email = user ? user.email : guestEmail.trim() || undefined;
      const name = user ? user.name : guestName.trim() || undefined;

      const res = await subscriptionService.checkout(
        selectedPlan.id,
        billingCycle,
        paymentMethod,
        email,
        name
      );

      setActiveTier(selectedPlan.id);
      setCheckoutSuccess(true);

      if (res.access_token && res.user) {
        setAuthSession(res.access_token, res.user);
      } else if (user) {
        updateUser({ subscription_tier: selectedPlan.id });
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err?.response?.data?.detail || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await subscriptionService.cancel();
      setActiveTier('starter');
      updateUser({ subscription_tier: 'starter' });
      setShowCancelModal(false);
    } catch (err: any) {
      console.error('Cancel subscription error:', err);
      alert(err?.response?.data?.detail || 'Failed to cancel subscription.');
    } finally {
      setIsCancelling(false);
    }
  };

  const faqs = [
    {
      q: 'Does Razorpay support UPI, Google Pay, and Indian NetBanking?',
      a: 'Yes! Razorpay supports all major Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM, CRED), RuPay & international credit/debit cards, NetBanking with 50+ banks, and popular digital wallets.'
    },
    {
      q: 'Can I cancel or switch my plan at any time?',
      a: 'Yes, absolutely! You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings without penalties.'
    },
    {
      q: 'How does the SBERT Dense Embedding matching work in Pro?',
      a: 'Unlike basic ATS keyword counters, our Pro tier utilizes Sentence-BERT dense 384-dimensional contextual embeddings to understand the true semantic meaning of your experience against job requirements.'
    },
    {
      q: 'Are the ML salary predictions personalized?',
      a: 'Yes. Our Random Forest regression models predict salary bands conditioned on your extracted tech stack, years of experience, degree, and target role, complete with SHAP feature contribution charts.'
    },
    {
      q: 'Do you offer refunds if I am not satisfied?',
      a: 'We offer a 14-day hassle-free money-back guarantee for all Pro and Enterprise subscriptions.'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent, Value-Packed Pricing
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Accelerate Your Career with <span className="gradient-text">Precision AI</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Choose the plan that fits your career trajectory. Upgrade to unlock unlimited AI parsing, SBERT semantic matching, and predictive ML models.
        </p>

        {/* Toggles Container */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Monthly / Yearly Billing Switch */}
          <div className="flex items-center gap-3">
            <span className={`text-xs sm:text-sm font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`w-14 h-7 rounded-full p-1 transition-colors cursor-pointer border ${
                billingCycle === 'yearly' ? 'bg-sky-500 border-sky-400' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Annual
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Save 20%
              </span>
            </span>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                currency === 'INR' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 INR (₹)</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                currency === 'USD' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐 USD ($)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      {isLoadingPlans ? (
        <div className="py-24 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span>Loading subscription plans...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.is_popular;
            const isCurrent = activeTier === plan.id;

            const isINR = currency === 'INR';
            const symbol = isINR ? (plan.symbol_inr || '₹') : plan.symbol;

            const monthlyVal = isINR ? (plan.price_inr_monthly || 0) : plan.price_monthly;
            const yearlyVal = isINR ? (plan.price_inr_yearly || 0) : plan.price_yearly;

            const price = billingCycle === 'yearly' && yearlyVal > 0 ? Math.round(yearlyVal / 12) : monthlyVal;
            const billedTotal = billingCycle === 'yearly' ? yearlyVal : monthlyVal;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-slate-900/90 via-indigo-950/30 to-slate-900/90 border-2 border-sky-500/80 shadow-2xl shadow-sky-500/15 scale-105 z-10'
                    : 'glass-panel border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  {/* Tier Title & Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="pb-4 border-b border-slate-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white">
                        {symbol}{price}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ month</span>
                    </div>
                    {billingCycle === 'yearly' && billedTotal > 0 && (
                      <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                        Billed annually ({symbol}{billedTotal}/yr)
                      </div>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Everything included:
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPopular ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Action Button */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 cursor-default'
                        : plan.id === 'starter' && activeTier !== 'starter'
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                        : isPopular
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 hover:shadow-sky-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Current Plan
                      </>
                    ) : plan.id === 'starter' ? (
                      activeTier !== 'starter' ? (
                        'Downgrade to Starter'
                      ) : (
                        'Use Free Starter'
                      )
                    ) : (
                      <>
                        <span>Upgrade to {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Comparison Matrix Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800/80 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Enterprise & Custom Volume Licensing</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Need custom integrations, dedicated GPU inference instances, or custom ATS parsers?
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/recruiter')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          Talk to Enterprise Sales
        </button>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6 pt-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-400 mt-1">Answers to common billing and plan inquiries</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-900/40"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Subscription Activated!</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto">
                  You are now upgraded to <span className="text-sky-400 font-bold">{selectedPlan.name}</span>. All premium machine learning and ATS features have been unlocked.
                </p>
                {razorpayPaymentId && (
                  <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-slate-400 border border-slate-700">
                    Payment ID: {razorpayPaymentId}
                  </div>
                )}
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(null);
                      navigate('/upload');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow hover:opacity-95 cursor-pointer"
                  >
                    Analyze Resume Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(null);
                      navigate('/dashboard');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Secure Checkout
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Upgrade to {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Billed {billingCycle} • Cancel anytime with 1-click
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Logged in or Guest details */}
                {user ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Subscribing as <strong className="text-white">{user.email}</strong></span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Current: {activeTier}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/70">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">Account Details</span>
                      <Link to="/login?redirect=/pricing" className="text-[11px] text-sky-400 hover:underline">
                        Already have an account? Sign in
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="email"
                          placeholder="Your email address (e.g. alex@example.com)"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Full name (optional)"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan Summary Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{selectedPlan.name} Plan</div>
                    <div className="text-xs text-slate-400">
                      {billingCycle === 'yearly' ? 'Annual Commitment (20% Off)' : 'Monthly Flexible'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-white">
                      {currency === 'INR' ? (selectedPlan.symbol_inr || '₹') : selectedPlan.symbol}
                      {currency === 'INR'
                        ? (billingCycle === 'yearly' ? selectedPlan.price_inr_yearly : selectedPlan.price_inr_monthly)
                        : (billingCycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly)}
                    </div>
                    <div className="text-[10px] text-slate-500">total billed today</div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === 'razorpay'
                          ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span className="text-[#0c2340] bg-white px-1 rounded text-[10px]">R</span>
                        <span>Razorpay</span>
                      </div>
                      <span className="text-[9px] text-sky-400">UPI / GPay / Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('demo')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === 'demo'
                          ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold">⚡ Sandbox</span>
                      <span className="text-[9px] text-slate-400">Instant Test</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === 'card'
                          ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-[9px] text-slate-400">Direct Card</span>
                    </button>
                  </div>
                </div>

                {/* Razorpay Banner & Options */}
                {paymentMethod === 'razorpay' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0284c7]/10 to-slate-950 border border-sky-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0284c7] flex items-center justify-center text-white font-black text-xs shadow-md">
                          R
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Razorpay Standard Checkout</div>
                          <div className="text-[10px] text-slate-400">Official Payment Gateway</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Live / Sandbox Ready
                      </span>
                    </div>
                    <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">📱 UPI / QR</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">⚡ Google Pay</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">🟣 PhonePe</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">💳 Visa / RuPay / MC</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">🏦 NetBanking</span>
                    </div>
                  </div>
                )}

                {/* Direct Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Expires</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">CVC</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Demo Sandbox Note */}
                {paymentMethod === 'demo' && (
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 flex-shrink-0" />
                    <span>Instant Demo: Simulates real transaction and immediately unlocks Pro privileges in Supabase!</span>
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={paymentMethod === 'razorpay' ? handleRazorpayCheckout : handleStandardCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting to Payment Gateway...
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <span>Pay with Razorpay • {currency === 'INR' ? '₹' : '$'}
                        {currency === 'INR'
                          ? (billingCycle === 'yearly' ? selectedPlan.price_inr_yearly : selectedPlan.price_inr_monthly)
                          : (billingCycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly)}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Complete Payment • {currency === 'INR' ? '₹' : '$'}
                      {currency === 'INR'
                        ? (billingCycle === 'yearly' ? selectedPlan.price_inr_yearly : selectedPlan.price_inr_monthly)
                        : (billingCycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly)}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Downgrade / Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Revert to Starter Tier?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cancelling your subscription will revert your account to the free Starter tier at the end of your billing cycle. You will lose access to SBERT semantic matching and Random Forest salary models.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                Keep My Plan
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Downgrade</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
