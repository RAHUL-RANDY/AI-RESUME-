import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AnalysisProvider } from './hooks/useResumeAnalysis';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { RouteProgressBar } from './components/RouteProgressBar';
import { Home } from './pages/Home';
import { UploadPage } from './pages/UploadPage';
import { DashboardPage } from './pages/DashboardPage';
import { MentorPage } from './pages/MentorPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { RecruiterPage } from './pages/RecruiterPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PricingPage } from './pages/PricingPage';
import { CoursesPage } from './pages/CoursesPage';
import { LoadingPage } from './pages/LoadingPage';
import { VoiceInterviewPage } from './pages/VoiceInterviewPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { CoverLetterPage } from './pages/CoverLetterPage';
import { JobTrackerPage } from './pages/JobTrackerPage';
import { JobSearchPage } from './pages/JobSearchPage';
import { SalaryNegotiationPage } from './pages/SalaryNegotiationPage';
import { DeveloperProfilePage } from './pages/DeveloperProfilePage';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { MobileBottomNav } from './components/MobileBottomNav';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('has_booted_app');
    } catch {
      return true;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('has_booted_app', 'true');
    } catch {
      // ignore
    }
  };
  return (
    <Router>
      <RouteProgressBar />
      {showSplash && <LoadingScreen onComplete={handleSplashComplete} minDurationMs={1800} />}
      <ThemeProvider>
        <AuthProvider>
          <AnalysisProvider>
            <div className="min-h-screen flex flex-col app-container selection:bg-sky-500/30 selection:text-sky-200">
              <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
              <main className="flex-1 pb-20 lg:pb-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/mentor" element={<MentorPage />} />
                  <Route path="/interview" element={<InterviewPrepPage />} />
                  <Route path="/voice-interview" element={<VoiceInterviewPage />} />
                  <Route path="/resume-builder" element={<ResumeBuilderPage />} />
                  <Route path="/cover-letter" element={<CoverLetterPage />} />
                  <Route path="/tracker" element={<JobTrackerPage />} />
                  <Route path="/jobs" element={<JobSearchPage />} />
                  <Route path="/job-search" element={<JobSearchPage />} />
                  <Route path="/salary-negotiator" element={<SalaryNegotiationPage />} />
                  <Route path="/negotiate" element={<SalaryNegotiationPage />} />
                  <Route path="/salary" element={<SalaryNegotiationPage />} />
                  <Route path="/developer-profile" element={<DeveloperProfilePage />} />
                  <Route path="/recruiter" element={<RecruiterPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/plans" element={<PricingPage />} />
                  <Route path="/plan" element={<PricingPage />} />
                  <Route path="/subscription" element={<PricingPage />} />
                  <Route path="/loading" element={<LoadingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </main>
              <Footer />
              <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
              <PerformanceMonitor />
            </div>
          </AnalysisProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
