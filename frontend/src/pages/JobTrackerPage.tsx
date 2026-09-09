import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  DollarSign,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';

interface JobApp {
  id: string;
  company: string;
  role: string;
  location?: string;
  salary?: string;
  status: 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  applied_date?: string;
  next_step?: string;
  notes?: string;
  job_url?: string;
  contact_email?: string;
}

const COLUMNS: { key: JobApp['status']; title: string; color: string; badgeBg: string }[] = [
  { key: 'Wishlist', title: 'Target Wishlist', color: 'border-amber-500/40 text-amber-300', badgeBg: 'bg-amber-500/10' },
  { key: 'Applied', title: 'Submitted / Applied', color: 'border-sky-500/40 text-sky-300', badgeBg: 'bg-sky-500/10' },
  { key: 'Interviewing', title: 'Interviewing', color: 'border-indigo-500/40 text-indigo-300', badgeBg: 'bg-indigo-500/10' },
  { key: 'Offer', title: 'Offer Received', color: 'border-emerald-500/40 text-emerald-300', badgeBg: 'bg-emerald-500/10' },
];

export const JobTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApp[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileColumnFilter, setMobileColumnFilter] = useState<'All' | JobApp['status']>('All');

  // New Application Form State
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('Remote / Hybrid');
  const [newSalary, setNewSalary] = useState('$140,000 - $175,000');
  const [newStatus, setNewStatus] = useState<JobApp['status']>('Applied');
  const [newNextStep, setNewNextStep] = useState('Follow up with recruiter');
  const [newNotes, setNewNotes] = useState('');
  const [newJobUrl, setNewJobUrl] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const fetchAppsAndStats = async () => {
    try {
      const [resApps, resStats] = await Promise.all([
        fetch(`${API_BASE}/tracker/applications`),
        fetch(`${API_BASE}/tracker/stats`)
      ]);
      if (resApps.ok && resStats.ok) {
        const appsData = await resApps.json();
        const statsData = await resStats.json();
        setApplications(appsData);
        setStats(statsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppsAndStats();
  }, []);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;

    try {
      const res = await fetch(`${API_BASE}/tracker/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: newCompany,
          role: newRole,
          location: newLocation,
          salary: newSalary,
          status: newStatus,
          next_step: newNextStep,
          notes: newNotes,
          job_url: newJobUrl
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewCompany('');
        setNewRole('');
        setNewNotes('');
        setNewJobUrl('');
        fetchAppsAndStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (appId: string, nextStatus: JobApp['status']) => {
    // Optimistic UI update
    setApplications(applications.map(a => a.id === appId ? { ...a, status: nextStatus } : a));
    try {
      await fetch(`${API_BASE}/tracker/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchAppsAndStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (appId: string) => {
    setApplications(applications.filter(a => a.id !== appId));
    try {
      await fetch(`${API_BASE}/tracker/applications/${appId}`, {
        method: 'DELETE'
      });
      fetchAppsAndStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interactive Career Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Job Application <span className="gradient-text">Kanban Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize applications, manage technical interview rounds, and monitor your candidate conversion funnel.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium uppercase">Active Pipeline</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total_active}</div>
            <div className="text-[11px] text-slate-500 mt-1">Tracked opportunities</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium uppercase">In Interviewing</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{stats.interviewing}</div>
            <div className="text-[11px] text-slate-500 mt-1">Technical screens & on-sites</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium uppercase">Offers Received</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.offers}</div>
            <div className="text-[11px] text-slate-500 mt-1">Under package review</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium uppercase">Conversion Rate</div>
            <div className="text-2xl font-black text-sky-400 mt-1">{stats.interview_conversion_rate}</div>
            <div className="text-[11px] text-slate-500 mt-1">App to interview yield</div>
          </div>
        </div>
      )}

      {/* Mobile Column Filter Pills */}
      <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        <button
          onClick={() => setMobileColumnFilter('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            mobileColumnFilter === 'All'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          All Stages ({applications.length})
        </button>
        {COLUMNS.map((col) => {
          const count = applications.filter((a) => a.status === col.key).length;
          return (
            <button
              key={col.key}
              onClick={() => setMobileColumnFilter(col.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                mobileColumnFilter === col.key
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {col.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          if (mobileColumnFilter !== 'All' && mobileColumnFilter !== col.key) {
            return null;
          }
          const columnApps = applications.filter((a) => a.status === col.key);
          return (
            <div key={col.key} className="flex flex-col bg-slate-900/50 rounded-2xl p-4 border border-slate-800 min-h-[550px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.key === 'Offer' ? 'bg-emerald-400' : col.key === 'Interviewing' ? 'bg-indigo-400' : col.key === 'Applied' ? 'bg-sky-400' : 'bg-amber-400'}`} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {col.title}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeBg} ${col.color}`}>
                  {columnApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnApps.map((app) => (
                  <div
                    key={app.id}
                    className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition shadow-lg group relative space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-snug">{app.role}</h4>
                        <div className="text-xs font-semibold text-sky-400 mt-0.5">{app.company}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata tags */}
                    <div className="space-y-1 text-[11px] text-slate-400">
                      {app.salary && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                          <DollarSign className="w-3 h-3 shrink-0" />
                          <span>{app.salary}</span>
                        </div>
                      )}
                      {app.location && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{app.location}</span>
                        </div>
                      )}
                      {app.applied_date && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Applied: {app.applied_date}</span>
                        </div>
                      )}
                    </div>

                    {/* Next step highlight */}
                    {app.next_step && (
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-semibold text-sky-400">Next: </span>
                        {app.next_step}
                      </div>
                    )}

                    {/* Quick Move Bar */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Move to:</span>
                      <div className="flex items-center gap-1">
                        {COLUMNS.filter(c => c.key !== app.status).map(c => (
                          <button
                            key={c.key}
                            onClick={() => handleStatusChange(app.id, c.key)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            {c.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {columnApps.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-500 font-medium">
                    No applications here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-400" />
              Track New Job Opportunity
            </h3>

            <form onSubmit={handleAddApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. OpenAI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Staff AI Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Salary Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Initial Pipeline Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                >
                  <option value="Wishlist">Target Wishlist</option>
                  <option value="Applied">Submitted / Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer Received</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Next Milestone / Immediate Action</label>
                <input
                  type="text"
                  value={newNextStep}
                  onChange={(e) => setNewNextStep(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Job Post URL (Optional)</label>
                <input
                  type="url"
                  value={newJobUrl}
                  onChange={(e) => setNewJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold shadow-md transition"
                >
                  Save to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobTrackerPage;
