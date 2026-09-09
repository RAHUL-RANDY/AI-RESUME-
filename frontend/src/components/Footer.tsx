import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Globe, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 pt-14 pb-8 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                </div>
              </div>
              <span className="font-bold text-base text-white tracking-tight">CareerIntel</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The enterprise career acceleration platform for software engineers and technology leaders. Optimize resumes, rehearse live voice interviews, and secure top offers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational (99.99% Uptime)</span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">AI Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/upload" className="hover:text-white transition">ATS Resume Scanner</Link></li>
              <li><Link to="/resume-builder" className="hover:text-white transition">1-Click Resume Builder</Link></li>
              <li><Link to="/voice-interview" className="hover:text-white transition">Voice AI Simulator</Link></li>
              <li><Link to="/cover-letter" className="hover:text-white transition">Cover Letter & DMs</Link></li>
              <li><Link to="/tracker" className="hover:text-white transition">Job Kanban Tracker</Link></li>
              <li><Link to="/developer-profile" className="hover:text-white transition">Developer Profile Intel</Link></li>
            </ul>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-white transition">Career Dashboard</Link></li>
              <li><Link to="/mentor" className="hover:text-white transition">AI Executive Mentor</Link></li>
              <li><Link to="/courses" className="hover:text-white transition">Skill Upskilling Courses</Link></li>
              <li><Link to="/recruiter" className="hover:text-white transition">Recruiter Talent Search</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Pro & Enterprise Plans</Link></li>
            </ul>
          </div>

          {/* Col 3: Trust & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> SOC2 Type II Certified
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> GDPR & CCPA Compliant
              </li>
              <li className="text-slate-400">256-Bit SSL Encryption</li>
              <li className="text-slate-400">Zero Data Broker Sharing</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} CareerIntel Inc. All rights reserved. Empowering top global technology talent.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition">Security</a>
            <a href="#" className="hover:text-slate-300 transition">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
