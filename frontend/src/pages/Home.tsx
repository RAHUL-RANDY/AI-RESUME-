import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  LayoutDashboard,
  Target,
  TrendingUp,
  Compass,
  Bot,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mic,
  FileText,
  Send,
  Kanban,
  Star,
  Zap,
  Building2,
  Award,
  ChevronRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const stats = [
    { label: "Career Offers Landed", value: "48,000+" },
    { label: "Average Salary Boost", value: "+34%" },
    { label: "ATS Interview Rate", value: "89.4%" },
    { label: "Partner Companies", value: "650+" }
  ];

  const features = [
    {
      icon: Target,
      title: "Precision ATS Resume Optimization",
      desc: "Benchmark your resume against real Workday, Greenhouse, and Lever filters. Get instant 100-point scoring across skills, action verbs, and quantitative impact.",
      badge: "Industry Standard"
    },
    {
      icon: Mic,
      title: "Live AI Voice Interview Simulator",
      desc: "Simulate high-stakes engineering technical and behavioral rounds out loud. Get instant coaching on filler words, speaking pace (WPM), and STAR structure.",
      badge: "Interactive Voice"
    },
    {
      icon: TrendingUp,
      title: "Market Compensation & Hiring Insights",
      desc: "Unlock predictive salary intelligence and market hiring probabilities based on verified engineering compensation data across FAANG and top startups.",
      badge: "Data-Backed"
    },
    {
      icon: Send,
      title: "AI Cover Letter & Recruiter Outreach",
      desc: "Generate tailored cover letters and hyper-personalized recruiter cold emails and LinkedIn InMails that achieve up to 4x higher reply rates.",
      badge: "High-Response"
    },
    {
      icon: Kanban,
      title: "Full-Cycle Job Application Tracker",
      desc: "Manage your entire job search in an interactive Kanban pipeline. Track wishlists, interviews, follow-ups, and offers with automated conversion analytics.",
      badge: "Workflow"
    },
    {
      icon: Compass,
      title: "Personalized Career Roadmap & Skill Radar",
      desc: "Identify missing high-demand technical skills with spider radar charts and follow step-by-step monthly milestones to level up your engineering career.",
      badge: "Personalized"
    }
  ];

  const testimonials = [
    {
      quote: "CareerIntel completely transformed my job search. The ATS resume scoring and live voice interview practice helped me land an offer at Stripe with a 40% salary increase.",
      author: "David Chen",
      role: "Senior Backend Engineer at Stripe",
      company: "Stripe"
    },
    {
      quote: "The recruiter cold email generator and LinkedIn InMail suite got me 7 recruiter callbacks in my first week. An absolute game-changer for serious tech candidates.",
      author: "Priya Sundaram",
      role: "Full Stack Engineer at Vercel",
      company: "Vercel"
    },
    {
      quote: "The voice simulator caught all my subconscious filler words and fixed my interview pacing before my final loops at Google. Worth every penny.",
      author: "Marcus Vance",
      role: "Staff Software Engineer at Google",
      company: "Google"
    }
  ];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
      {/* Hero Section */}
      <section className="text-center pt-12 pb-16 lg:pt-20 lg:pb-24 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-[380px] h-[300px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-8 shadow-sm backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Next-Generation Career Intelligence Platform</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400 font-bold">Trusted by 48,000+ Engineers</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.18] sm:leading-[1.12]"
        >
          Land Your Next Tech Role <span className="gradient-text">3x Faster</span> With AI Intelligence
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-sm sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto mt-4 sm:mt-6 leading-relaxed px-2 sm:px-0"
        >
          The enterprise career acceleration suite for software engineers and technology leaders. Optimize your resume for top ATS systems, rehearse live voice interviews, generate recruiter outreach, and negotiate top-of-market compensation.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto"
        >
          <Link
            to="/upload"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 transition transform active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            Analyze Your Resume Free
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          <Link
            to="/voice-interview"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-md"
          >
            <Mic className="w-4 h-4 text-sky-400" />
            Try Voice Interview Simulator
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Guaranteed ATS Compatibility
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" /> Real-Time Voice Feedback
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Bank-Grade Privacy & Encryption
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" /> No Credit Card Required
          </span>
        </div>
      </section>

      {/* Stats Proof Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-800 text-center space-y-1 shadow-lg">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight gradient-text">
              {item.value}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </section>

      {/* Feature Suite Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">Comprehensive Career Arsenal</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Command Top Tech Offers
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            A unified suite designed to take you from cold applications to signed executive offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition shadow-xl group relative space-y-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 uppercase tracking-wider">
                    {feat.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials Social Proof */}
      <section className="space-y-10 py-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Member Success Stories</div>
          <h2 className="text-3xl font-extrabold text-white">Proven Results at World-Class Companies</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{t.author}</div>
                  <div className="text-[11px] text-slate-400">{t.role}</div>
                </div>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 font-mono">
                  {t.company}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="pb-12">
        <div className="rounded-3xl bg-gradient-to-r from-sky-950/70 via-indigo-950/70 to-purple-950/70 p-8 sm:p-12 border border-sky-500/20 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Engineering Career?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join thousands of software engineers, tech leads, and managers who use CareerIntel to negotiate higher compensation and master top interviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/upload"
              className="px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-slate-950 hover:bg-slate-100 shadow-xl transition transform active:scale-95"
            >
              Get Started Now — It's Free
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition"
            >
              View Membership Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
