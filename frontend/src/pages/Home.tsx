import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Target,
  TrendingUp,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mic,
  Kanban,
  Star,
  Zap,
  Building2,
  CheckCircle2,
  Lock,
  ChevronRight,
  Briefcase,
  FileCheck,
  Activity,
  Layers,
  BarChart3,
  Cpu
} from 'lucide-react';

export const Home: React.FC = () => {
  const stats = [
    { label: "Executive Offers Landed", value: "48,000+", change: "+14.2% MoM" },
    { label: "Median TC Elevation", value: "+$42,500", change: "+34% Avg." },
    { label: "ATS Pass-Through Rate", value: "98.4%", change: "Workday & Greenhouse" },
    { label: "Top Tech Employers", value: "650+", change: "FAANG & Tier-1 Startups" }
  ];

  const trustedCompanies = [
    "Google", "Stripe", "OpenAI", "Meta", "Vercel", "Microsoft", "Anthropic", "Datadog"
  ];

  const features = [
    {
      icon: Target,
      title: "Workday & Greenhouse ATS Engine",
      desc: "Instant 100-point parse auditing calibrated directly against enterprise ATS parsers. Uncover missing semantic keywords, hard skill density, and quantitative metrics.",
      badge: "Enterprise Grade",
      badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10"
    },
    {
      icon: Mic,
      title: "Interactive Voice AI Interviewer",
      desc: "Simulate high-pressure System Design and Behavioral rounds out loud with zero latency. Receive immediate scoring on filler words, speaking cadence, and STAR delivery.",
      badge: "Real-time Audio",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    },
    {
      icon: TrendingUp,
      title: "Predictive Compensation Analytics",
      desc: "Access verified compensation data and Machine Learning models to calculate your 90th percentile equity and base salary targets across major tech hubs.",
      badge: "Verified Data",
      badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
    },
    {
      icon: Layers,
      title: "AI Recruiter Outreach & InMails",
      desc: "Synthesize high-conversion cold emails and executive LinkedIn InMails tailored to specific engineering managers and hiring teams with 4x industry reply rates.",
      badge: "High Yield",
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10"
    },
    {
      icon: Kanban,
      title: "Full-Cycle Application Pipeline",
      desc: "Track every lead, referral, recruiter screen, and technical loop in a high-speed Kanban workflow with automated interview reminders and pipeline analytics.",
      badge: "Workflow HUD",
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10"
    },
    {
      icon: Compass,
      title: "ML Career Competency Radar",
      desc: "Vector-distance matching compares your exact resume against thousands of top-earning engineering profiles to highlight your highest-ROI technical skill gaps.",
      badge: "SBERT Vector Match",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
    }
  ];

  const testimonials = [
    {
      quote: "The ATS diagnostic identified three missing distributed systems keywords that were getting my resume automatically filtered. After updating, I secured interview loops at both Stripe and Datadog, ultimately accepting an L6 offer.",
      author: "David Chen",
      role: "Staff Software Engineer",
      company: "Stripe",
      verified: true
    },
    {
      quote: "The AI Voice simulator was ruthless about my speaking pace and waffle answers. Practicing the behavioral loops out loud gave me the exact composure I needed to pass Google's hiring committee.",
      author: "Marcus Vance",
      role: "Senior Infrastructure Engineer",
      company: "Google",
      verified: true
    },
    {
      quote: "The recruiter outreach generator and salary benchmarking tool helped me negotiate an additional $48,000 in equity. CareerIntel pays for itself a hundred times over on day one.",
      author: "Priya Sundaram",
      role: "Lead Full Stack Engineer",
      company: "Vercel",
      verified: true
    }
  ];

  return (
    <div className="relative min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24 sm:space-y-32">
      {/* Background ambient lighting */}
      <div className="sv-ambient-spotlight -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[450px] opacity-70"></div>
      <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-2/3 -left-40 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Hero Section */}
      <section className="text-center pt-8 pb-12 lg:pt-16 lg:pb-16 relative">
        {/* Silicon Valley Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.12] text-xs font-semibold text-slate-300 mb-8 shadow-[0_2px_14px_rgba(0,0,0,0.4)] backdrop-blur-xl group hover:border-sky-500/40 transition-all cursor-default"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span className="sv-text-gradient-silver tracking-tight">CareerIntel AI Engine 3.4 Live</span>
          <span className="text-white/20">|</span>
          <span className="text-sky-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> FAANG Calibrated
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12] lg:leading-[1.08]"
        >
          Architect Your Tech Career With <span className="sv-text-gradient-cyan">Executive AI Intelligence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto mt-6 leading-relaxed font-normal"
        >
          The definitive career acceleration platform for software engineers, engineering leaders, and data scientists. Beat enterprise ATS filters, rehearse voice interview rounds out loud, and unlock top-decile market compensation.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mx-auto"
        >
          <Link
            to="/upload"
            className="w-full sm:w-auto sv-btn-primary px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group"
          >
            <UploadCloud className="w-4 h-4 text-sky-200 group-hover:scale-110 transition-transform" />
            Analyze Resume Instantly
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/voice-interview"
            className="w-full sm:w-auto sv-btn-secondary px-7 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 group"
          >
            <Mic className="w-4 h-4 text-sky-400 group-hover:text-sky-300 transition-colors" />
            Launch Voice Simulator
          </Link>
        </motion.div>

        {/* Interactive Live Telemetry Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-white/[0.14] via-white/[0.04] to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="rounded-[15px] bg-slate-950/90 border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-7 text-left space-y-6">
              {/* Telemetry Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Live Candidate Telemetry Preview</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>SBERT v2.8 Model • 512-dim Cosine Similarity</span>
                </div>
              </div>

              {/* Telemetry Visual Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>ATS Pass Score</span>
                    <span className="text-emerald-400 font-bold font-mono">98.4 / 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full w-[98.4%] rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-slate-400">Workday & Greenhouse parser compliant</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Target Compensation</span>
                    <span className="text-sky-400 font-bold font-mono">$185k - $225k</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full w-[88%] rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-slate-400">92nd percentile for Senior Full Stack</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Voice STAR Score</span>
                    <span className="text-purple-400 font-bold font-mono">94% Clarity</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[94%] rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-slate-400">Pace 132 WPM • Zero filler words</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Logos Social Proof */}
        <div className="mt-16 pt-10 border-t border-white/[0.06]">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-6">
            Trusted by engineers hired across world-class engineering organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70 hover:opacity-100 transition-opacity">
            {trustedCompanies.map((company, i) => (
              <span key={i} className="text-sm sm:text-base font-extrabold tracking-tight text-slate-400 hover:text-white transition-colors font-mono">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact Stat Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => (
          <div key={idx} className="sv-card rounded-2xl p-6 text-center space-y-2 group">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight sv-text-gradient-silver group-hover:scale-105 transition-transform duration-200">
              {item.value}
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-semibold">
              {item.label}
            </div>
            <div className="text-[11px] font-mono text-sky-400">
              {item.change}
            </div>
          </div>
        ))}
      </section>

      {/* Feature Suite Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Activity className="w-3 h-3" /> Comprehensive Intelligence Suite
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Engineers Who Expect Top Offers
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            From algorithmic ATS parsing and real-time audio interview simulators to predictive offer negotiation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                className="sv-card rounded-2xl p-7 flex flex-col justify-between space-y-6 group"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-white/[0.08] flex items-center justify-center text-sky-400 shadow-inner group-hover:border-sky-500/40 group-hover:scale-105 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider font-mono ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:text-sky-300 transition-colors">
                  <span>Explore capability</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Verified Member Testimonials */}
      <section className="space-y-12 py-4">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Candidate Outcomes
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            High-Impact Offers at Industry Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="sv-card rounded-2xl p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>{t.author}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="text-[11px] text-slate-400">{t.role}</div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-white/[0.08] text-[10px] font-bold text-slate-200 font-mono">
                  {t.company}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Luxury Call to Action Banner */}
      <section className="pb-12">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center space-y-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Next Career Move?
            </h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              Join thousands of engineers who use CareerIntel to bypass applicant filters, command higher compensation, and ace technical loops.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              to="/upload"
              className="sv-btn-primary px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 group"
            >
              Analyze Your Resume Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="sv-btn-secondary px-8 py-3.5 rounded-xl font-semibold text-sm"
            >
              View Membership Tiers
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-medium pt-2 relative z-10">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> SOC2 Type II Certified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Free Tier Available
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
