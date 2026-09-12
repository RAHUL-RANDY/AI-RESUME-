import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Building2,
  Briefcase,
  Layers,
  Award,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Send,
  PhoneCall,
  Flame,
  Scale,
  RefreshCw,
  Zap
} from 'lucide-react';
import { negotiationService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { OfferAnalysisResult, CounterOfferResponse } from '../types';

export const SalaryNegotiationPage: React.FC = () => {
  const navigate = useNavigate();
  const { parsedResume, targetRole } = useResumeAnalysis();

  // Form State
  const [company, setCompany] = useState('Stripe');
  const [role, setRole] = useState(targetRole || parsedResume?.target_role || 'Senior Software Engineer');
  const [level, setLevel] = useState('Senior');
  const [baseSalary, setBaseSalary] = useState<number>(165000);
  const [equity, setEquity] = useState<number>(55000);
  const [signOn, setSignOn] = useState<number>(20000);
  const [bonus, setBonus] = useState<number>(15000);
  const [competingOffers, setCompetingOffers] = useState<number>(1);
  const [yearsExperience, setYearsExperience] = useState<number>(parsedResume?.total_experience_years || 5);

  // Strategy State
  const [strategy, setStrategy] = useState<'competing_offer' | 'market_value' | 'equity_pivot' | 'remote_benefits'>('competing_offer');
  const [competingDetails, setCompetingDetails] = useState('Strong interest and pending final round with Datadog at $260k TC');

  // Results State
  const [analysis, setAnalysis] = useState<OfferAnalysisResult | null>(null);
  const [counter, setCounter] = useState<CounterOfferResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const candidateName = parsedResume?.name || 'Alex Chen';

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Run initial analysis
  useEffect(() => {
    handleAnalyze();
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await negotiationService.analyzeOffer({
        company,
        role,
        level,
        base_salary: baseSalary,
        equity,
        sign_on: signOn,
        bonus,
        competing_offers: competingOffers,
        years_experience: yearsExperience,
      });
      setAnalysis(res);

      // Auto generate counter offer with current strategy
      const currentTC = res.total_comp ?? res.total_annual_compensation;
      const targetTC = res.target_tc ?? Math.round(currentTC + (res.money_left_on_table || 15000));
      generateCounterWithData(currentTC, targetTC);
    } catch (err) {
      console.error('Failed to analyze offer:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCounterWithData = async (currentTC: number, targetTC: number) => {
    setIsGenerating(true);
    try {
      const counterRes = await negotiationService.generateCounter({
        candidate_name: candidateName,
        company,
        role,
        current_offer_tc: currentTC,
        target_tc: targetTC,
        strategy,
        competing_details: competingDetails,
        key_strengths: parsedResume?.skills?.slice(0, 5) || ['Distributed Systems', 'TypeScript', 'FastAPI'],
      });
      setCounter(counterRes);
    } catch (e) {
      console.error('Failed to generate counter offer:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStrategyChange = (newStrategy: typeof strategy) => {
    setStrategy(newStrategy);
    if (analysis) {
      const currentTC = analysis.total_comp ?? analysis.total_annual_compensation;
      const targetTC = analysis.target_tc ?? Math.round(currentTC + (analysis.money_left_on_table || 15000));
      generateCounterWithData(currentTC, targetTC);
    }
  };

  // Calculate live total compensation
  const totalComp = baseSalary + equity + signOn + bonus;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-3.5 h-3.5" />
              Total Compensation & Leverage Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Scale className="w-8 h-8 text-emerald-400" />
              AI Salary & Offer Negotiation Studio
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Benchmark tech compensation packages against market percentiles and generate tactically proven counter-offers, phone scripts, and objection rebuttals.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Current 1st-Year TC</p>
              <p className="text-lg font-extrabold text-white">
                ${(totalComp / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-400">/year</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Inputs & Market Analysis vs Strategy & Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Inputs & Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Offer Inputs Card */}
            <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-400" />
                  Offer Details & Parameters
                </h3>
                <span className="text-[11px] text-slate-500">Live Evaluation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                    placeholder="e.g. OpenAI, Stripe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Level / Seniority</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="Entry">Entry (L3 / Associate)</option>
                    <option value="Mid">Mid-Level (L4)</option>
                    <option value="Senior">Senior (L5)</option>
                    <option value="Staff">Staff / Principal (L6+)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Target Role Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Senior Full Stack Engineer"
                />
              </div>

              {/* Compensation Sliders / Inputs */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Compensation Breakdown ($ USD)
                </h4>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Annual Base Salary</span>
                    <span className="font-bold text-white">${baseSalary.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={70000}
                    max={300000}
                    step={5000}
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full accent-primary-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Annual Equity (RSUs / Year)</span>
                    <span className="font-bold text-white">${equity.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200000}
                    step={5000}
                    value={equity}
                    onChange={(e) => setEquity(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Sign-On Bonus ($)</label>
                    <input
                      type="number"
                      step={2500}
                      value={signOn}
                      onChange={(e) => setSignOn(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Annual Bonus ($)</label>
                    <input
                      type="number"
                      step={2500}
                      value={bonus}
                      onChange={(e) => setBonus(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Competing Offers</label>
                    <select
                      value={competingOffers}
                      onChange={(e) => setCompetingOffers(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                    >
                      <option value={0}>0 (Single offer)</option>
                      <option value={1}>1 competing offer</option>
                      <option value={2}>2 competing offers</option>
                      <option value={3}>3+ active offers</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Experience (Years)</label>
                    <input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calculating Market Percentiles...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Re-Analyze Offer & Benchmarks
                  </>
                )}
              </button>
            </div>

            {/* Market Benchmark Card */}
            {analysis && (
              <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Market Compensation Percentiles
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {analysis.offer_rating || analysis.health_status}
                  </span>
                </div>

                {/* Upside Alert Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                      Money Left on the Table
                    </span>
                    <p className="text-2xl font-black text-white">
                      +${((analysis.potential_upside ?? analysis.money_left_on_table ?? 15000) / 1000).toFixed(0)}k
                      <span className="text-xs font-normal text-slate-400 ml-1.5">potential increase</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Target Counter TC</span>
                    <p className="text-base font-bold text-emerald-300">
                      ${((analysis.target_tc ?? (analysis.total_comp ?? analysis.total_annual_compensation) + 15000) / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>

                {/* Percentile Progress Bars */}
                {(() => {
                  const median = analysis.market_benchmarks?.p50 ?? analysis.market_median;
                  const p25 = analysis.market_benchmarks?.p25 ?? Math.round(median * 0.85);
                  const p75 = analysis.market_benchmarks?.p75 ?? analysis.market_75th_percentile;
                  const p90 = analysis.market_benchmarks?.p90 ?? analysis.market_90th_percentile;
                  const tc = analysis.total_comp ?? analysis.total_annual_compensation;
                  const pctWidth = Math.min(100, Math.max(10, ((tc - p25) / (p90 - p25 || 1)) * 100));

                  return (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>25th (${(p25 / 1000).toFixed(0)}k)</span>
                        <span className="font-semibold text-slate-300">Median (${(median / 1000).toFixed(0)}k)</span>
                        <span>75th (${(p75 / 1000).toFixed(0)}k)</span>
                        <span className="text-emerald-400 font-semibold">90th (${(p90 / 1000).toFixed(0)}k)</span>
                      </div>

                      <div className="w-full h-3.5 bg-slate-950 rounded-full border border-slate-800 relative overflow-hidden flex">
                        <div
                          className="h-full bg-gradient-to-r from-primary-600 via-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${pctWidth}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {analysis.recommendation || `This offer is currently rated ${analysis.health_status}.`}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Column: AI Counter-Offer Studio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Strategy Selector Tabs */}
            <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Tactical Counter-Offer Strategy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your negotiation posture to dynamically tailor tone, talking points, and email verbiage.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'competing_offer',
                    title: 'Competing Offer',
                    desc: 'High leverage leverage'
                  },
                  {
                    id: 'market_value',
                    title: 'Market Value',
                    desc: 'Skill & benchmark based'
                  },
                  {
                    id: 'equity_pivot',
                    title: 'Equity Pivot',
                    desc: 'When base bands are locked'
                  },
                  {
                    id: 'remote_benefits',
                    title: 'Sign-On & Perks',
                    desc: 'Cash & flexibility pivot'
                  }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStrategyChange(s.id as any)}
                    className={`p-3 rounded-xl text-left transition border ${
                      strategy === s.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.title}</p>
                    <p className="text-[10px] opacity-75">{s.desc}</p>
                  </button>
                ))}
              </div>

              {strategy === 'competing_offer' && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-medium text-slate-300">
                    Competing Company or Pipeline Status
                  </label>
                  <input
                    type="text"
                    value={competingDetails}
                    onChange={(e) => setCompetingDetails(e.target.value)}
                    placeholder="e.g. Received $265k offer from Datadog with fast decision timeline"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Counter-Offer Deliverables Card */}
            <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6 shadow-xl">
              {isGenerating ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white">Drafting High-Impact Counter-Offer Package...</p>
                  <p className="text-xs text-slate-500">Fine-tuning non-adversarial phrasing and objection rebuttals</p>
                </div>
              ) : counter ? (
                <div className="space-y-6">
                  {/* Email Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        Ready-to-Send Counter Email
                      </h4>
                      <button
                        onClick={() => copyToClipboard(counter.email_body, 'email')}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
                      >
                        {copiedField === 'email' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Email
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-500 font-semibold">Subject: </span>
                      <span className="text-white font-medium">{counter.subject_line || counter.email_subject}</span>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans max-h-72 overflow-y-auto">
                      {counter.email_body}
                    </div>
                  </div>

                  {/* Phone Talking Points */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 text-primary-400" />
                        Live Phone Call Cheat Sheet
                      </h4>
                      <button
                        onClick={() => copyToClipboard((counter.phone_talking_points || counter.phone_call_talking_points || []).join('\n• '), 'phone')}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
                      >
                        {copiedField === 'phone' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Points
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(counter.phone_talking_points || counter.phone_call_talking_points || []).map((point: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recruiter Pushback Coach */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      Recruiter Pushback & Objection Rebuttals
                    </h4>

                    <div className="space-y-2.5">
                      {(counter.objection_rebuttals || counter.recruiter_pushback_rebuttals?.map(r => ({ objection: r.recruiter_pushback, response: r.suggested_verbiage })) || []).map((obj: any, i: number) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>If Recruiter Says: "{obj.objection}"</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed pl-5 font-medium">
                            <strong className="text-emerald-400">Your Response: </strong>
                            "{obj.response}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 text-xs">
                  Fill in your offer details on the left and click "Re-Analyze Offer" to generate your negotiation package.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Cross-Suite Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Exploring More Engineering Roles?</h4>
              <p className="text-xs text-slate-400">
                Browse our real-time tech openings matched directly against your resume embeddings.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-primary-600/20"
          >
            Explore AI Job Matches
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryNegotiationPage;
