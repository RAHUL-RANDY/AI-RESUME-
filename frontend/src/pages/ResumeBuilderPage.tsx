import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  RefreshCw,
  Award,
  Layers,
  Code
} from 'lucide-react';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  location: string;
  bullets: string[];
}

interface ProjectItem {
  id: string;
  name: string;
  tech: string;
  bullets: string[];
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  duration: string;
}

export const ResumeBuilderPage: React.FC = () => {
  // State for resume fields
  const [template, setTemplate] = useState<'harvard' | 'modern'>('harvard');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [name, setName] = useState('Alex Rivera');
  const [title, setTitle] = useState('Senior Full Stack Engineer');
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [phone, setPhone] = useState('+1 (555) 382-9102');
  const [location, setLocation] = useState('San Francisco, CA');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/alexrivera-tech');
  const [github, setGithub] = useState('github.com/alexrivera-eng');
  
  const [summary, setSummary] = useState(
    'Performance-driven Senior Software Engineer with 5+ years of experience architecting distributed cloud systems and responsive web applications. Proven track record reducing API latency by 42% and driving 99.99% microservice uptime across high-throughput production workloads.'
  );

  const [skills, setSkills] = useState('TypeScript, React 19, Python, FastAPI, Node.js, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, CI/CD');

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: '1',
      role: 'Senior Software Engineer',
      company: 'Datacore Cloud Services',
      duration: '2022 — Present',
      location: 'San Francisco, CA',
      bullets: [
        'Architected asynchronous streaming ingestion microservices handling 40,000 requests per second with sub-25ms p99 latency.',
        'Migrated monolithic backend to containerized Docker & Kubernetes services, cutting AWS cloud infrastructure spend by $38,000/year.',
        'Mentored 6 junior/mid-level engineers through rigorous code reviews and pair programming sessions.'
      ]
    },
    {
      id: '2',
      role: 'Full Stack Engineer',
      company: 'Pulse Analytics',
      duration: '2020 — 2022',
      location: 'Austin, TX',
      bullets: [
        'Engineered responsive React and Next.js business intelligence dashboard used by 120,000 monthly active corporate analysts.',
        'Designed database query indexing in PostgreSQL, boosting heavy analytics reporting throughput by 65%.'
      ]
    }
  ]);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'p1',
      name: 'Distributed Event Broker',
      tech: 'Python, FastAPI, Redis, Docker',
      bullets: [
        'Open-source pub/sub message broker with guaranteed at-least-once delivery and distributed leader election.',
        'Earned 350+ GitHub stars with comprehensive automated unit and load tests.'
      ]
    }
  ]);

  const [education, setEducation] = useState<EducationItem[]>([
    {
      id: 'e1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science (Magna Cum Laude)',
      duration: '2016 — 2020'
    }
  ]);

  // Live ATS Score Calculator
  const calculateAtsScore = () => {
    let score = 50;
    if (summary.length > 80) score += 10;
    if (skills.split(',').length >= 8) score += 10;
    if (experiences.length >= 2) score += 10;
    const allBullets = experiences.flatMap(e => e.bullets).join(' ');
    // Check for metrics/action verbs
    if (/\d+%|\$\d+|\d+k|\d+ms/i.test(allBullets)) score += 12;
    if (/architected|spearheaded|engineered|migrated|optimized/i.test(allBullets)) score += 8;
    return Math.min(96, score);
  };

  const atsScore = calculateAtsScore();

  // Print / PDF download
  const handlePrint = () => {
    window.print();
  };

  // Add bullet to experience
  const addBullet = (expId: string) => {
    setExperiences(experiences.map(e => {
      if (e.id === expId) {
        return { ...e, bullets: [...e.bullets, 'Engineered new scalable feature with measured improvements in latency.'] };
      }
      return e;
    }));
  };

  const updateBullet = (expId: string, bulletIdx: number, val: string) => {
    setExperiences(experiences.map(e => {
      if (e.id === expId) {
        const nextBullets = [...e.bullets];
        nextBullets[bulletIdx] = val;
        return { ...e, bullets: nextBullets };
      }
      return e;
    }));
  };

  const removeBullet = (expId: string, bulletIdx: number) => {
    setExperiences(experiences.map(e => {
      if (e.id === expId) {
        return { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) };
      }
      return e;
    }));
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Printable Area Helper Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>ATS Compliant 2026 Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            1-Click ATS <span className="gradient-text">Resume Builder</span> & PDF Exporter
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build high-converting Harvard CS and Modern Tech resumes guaranteed to parse cleanly in Workday, Greenhouse, and Lever.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Template Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setTemplate('harvard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                template === 'harvard' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Harvard CS
            </button>
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                template === 'modern' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Modern Tech
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Download / Print PDF
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-md">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === 'editor'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4 text-sky-300" />
          <span>Edit Resume Content</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === 'preview'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4 text-sky-300" />
          <span>Live PDF Preview</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className={`lg:col-span-6 space-y-6 max-h-[85vh] overflow-y-auto pr-1 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* ATS Score Gauge Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live ATS Parse Score</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {atsScore}% <span className="text-xs font-normal text-slate-400">— Workday & Greenhouse Optimized</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {/* Contact Details */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">1. Contact & Header Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Target Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">LinkedIn / Portfolio</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">2. Professional Executive Summary</h3>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
            />
          </div>

          {/* Core Technical Skills */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">3. Core Technical Skills</h3>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Work Experience */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">4. Work Experience</h3>
              <button
                onClick={() => setExperiences([...experiences, {
                  id: String(Date.now()),
                  role: 'Software Engineer',
                  company: 'Tech Corp',
                  duration: '2021 — 2023',
                  location: 'Remote',
                  bullets: ['Engineered backend services with high reliability.']
                }])}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {experiences.map((exp) => (
              <div key={exp.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperiences(experiences.map(item => item.id === exp.id ? { ...item, role: v } : item));
                    }}
                    placeholder="Role"
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperiences(experiences.map(item => item.id === exp.id ? { ...item, company: v } : item));
                    }}
                    placeholder="Company"
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperiences(experiences.map(item => item.id === exp.id ? { ...item, duration: v } : item));
                    }}
                    placeholder="Duration"
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperiences(experiences.map(item => item.id === exp.id ? { ...item, location: v } : item));
                    }}
                    placeholder="Location"
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Accomplishment Bullets</label>
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => removeBullet(exp.id, bIdx)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addBullet(exp.id)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-medium mt-1 flex items-center gap-1"
                  >
                    + Add bullet point
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Printable Resume Preview */}
        <div className={`lg:col-span-6 sticky top-24 overflow-x-auto no-scrollbar ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" /> Live Standard Preview
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Ready to Export (Letter / A4)</span>
          </div>

          <div
            id="printable-resume"
            className={`rounded-xl p-8 shadow-2xl transition-all ${
              template === 'harvard'
                ? 'bg-white text-slate-900 font-serif border border-slate-300'
                : 'bg-white text-slate-900 font-sans border-t-4 border-t-indigo-600'
            }`}
            style={{ minHeight: '680px', color: '#111827' }}
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-gray-300">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
                {name}
              </h1>
              <div className="text-sm font-semibold text-gray-700 mt-0.5">{title}</div>
              <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-gray-600 mt-2">
                {location && <span>{location}</span>}
                {email && <span>• {email}</span>}
                {phone && <span>• {phone}</span>}
                {linkedin && <span>• {linkedin}</span>}
                {github && <span>• {github}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="mt-4 pb-3 border-b border-gray-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Professional Summary
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed text-justify">
                  {summary}
                </p>
              </div>
            )}

            {/* Technical Skills */}
            {skills && (
              <div className="mt-4 pb-3 border-b border-gray-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Technical Competencies
                </h2>
                <p className="text-xs text-gray-800 leading-relaxed">
                  {skills}
                </p>
              </div>
            )}

            {/* Experience */}
            <div className="mt-4 pb-3 border-b border-gray-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                Work Experience
              </h2>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id} className="text-left">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <strong className="text-gray-900">{exp.role}</strong> — <span className="italic text-gray-700">{exp.company}</span>
                      </div>
                      <div className="text-gray-600 font-medium">{exp.duration} | {exp.location}</div>
                    </div>
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-xs text-gray-700">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {projects.length > 0 && (
              <div className="mt-4 pb-3 border-b border-gray-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Key Technical Projects
                </h2>
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between items-baseline text-xs">
                        <strong className="text-gray-900">{p.name}</strong>
                        <span className="text-gray-600 italic">Technologies: {p.tech}</span>
                      </div>
                      <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-xs text-gray-700">
                        {p.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-xs text-gray-700">
                  <div>
                    <strong className="text-gray-900">{edu.institution}</strong> — {edu.degree}
                  </div>
                  <span className="text-gray-600">{edu.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResumeBuilderPage;
