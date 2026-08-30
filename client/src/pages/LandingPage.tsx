import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.js';
import { ScrollReveal } from '../components/ScrollReveal.js';
import {
  GraduationCap,
  BookOpen,
  Share2,
  Sparkles,
  ArrowRight,
  Layers,
  Sun,
  Moon,
  Calendar,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Award,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the Weekly Class Timetable work?',
      a: 'The Weekly Timetable displays your teaching period slots (Monday to Friday, Period 1 to Period 6). You can set your assigned class section for each slot (e.g., Grade 9A, Grade 10B) and attach lesson plans with a single click.',
    },
    {
      q: 'Can I view uploaded PDF worksheets without downloading them?',
      a: 'Yes! Our built-in Resource Preview Modal uses native inline rendering and Google Docs viewer fallbacks so you can view PDFs, presentations, and documents directly inside your browser.',
    },
    {
      q: 'Can I keep my uploaded teaching materials private?',
      a: 'Absolutely. Every resource you upload gives you full control over privacy settings. You can mark files as Public for the teacher community or Private for your personal use only.',
    },
    {
      q: 'Can I duplicate lesson plans for multiple class sections?',
      a: 'Yes, with one click you can duplicate any existing lesson plan and adjust the date, grade, or topic without retyping objectives and activities from scratch.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>EduNexus Hub v2.0 is live! Featuring Weekly Timetables & Cross-Origin Document Previews.</span>
      </div>

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-5 flex items-center justify-between sticky top-0 z-40 glass-panel border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            EduNexus <span className="gradient-text font-extrabold">Hub</span>
          </span>
        </div>

        {/* Navigation Quick Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#workflow" className="hover:text-white transition">How It Works</a>
          <a href="#testimonials" className="hover:text-white transition">Educators</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-amber-400 border border-slate-700/60 transition-all flex items-center justify-center shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg-primary hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Built for Modern Educators & Schools
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
              Lesson Planning Made Effortless.{' '}
              <span className="gradient-text block mt-2">Shared Teaching Resources Reimagined.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Stop recreating lesson plans and worksheets from scratch. Organize your weekly period schedule, discover community teaching materials, and link real resources directly into your daily lessons.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold text-white gradient-bg-primary hover:opacity-95 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Free Educator Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-semibold text-slate-200 glass-panel hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>Demo Login Credentials</span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Live App UI Preview Graphic */}
          <ScrollReveal animation="zoom-in" delay={400}>
            <div className="pt-8">
              <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl relative max-w-5xl mx-auto overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-slate-500">edunexus.hub/calendar</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live System
                    </span>
                  </div>
                </div>

                {/* Sample Timetable Grid Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-400">Monday — Period 1</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">Grade 9A</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Photosynthesis & Cellular Respiration</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Biology
                      </span>
                      <span>45 mins</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-2 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-purple-400">Tuesday — Period 2</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">Grade 10B</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Quadratic Equations & Functions</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-blue-400">
                        <CheckCircle2 className="w-3 h-3" /> Mathematics
                      </span>
                      <span>45 mins</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-400">Wednesday — Period 3</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">Grade 11C</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">Newtonian Mechanics & Forces</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Eye className="w-3 h-3 text-amber-400" /> Attached PDF
                      </span>
                      <span>60 mins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Metrics & Impact Bar */}
      <section className="py-12 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">5,000+</div>
                <div className="text-xs text-slate-400 font-medium">Lesson Plans Created</div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={150}>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono">12,000+</div>
                <div className="text-xs text-slate-400 font-medium">Teaching Resources Shared</div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300}>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-mono">98%</div>
                <div className="text-xs text-slate-400 font-medium">Teacher Satisfaction</div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={450}>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-pink-400 font-mono">45 Mins</div>
                <div className="text-xs text-slate-400 font-medium">Average Time Saved Weekly</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Interactive Core Feature Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up" delay={0}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              <Zap className="w-3.5 h-3.5" />
              Core Platform Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything You Need for Exceptional Teaching
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Built specifically to streamline lesson preparation, class scheduling, and community resource sharing.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="glass-card rounded-3xl p-8 space-y-4 h-full">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Weekly Period Timetable</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Register your class periods (Grade 9A, Grade 10B) across Monday to Friday. Attach lesson plans to specific slots with one click.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="glass-card rounded-3xl p-8 space-y-4 h-full">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">In-App Document Viewer</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Preview PDFs, slides, and worksheets directly inside the app with full inline rendering and Google Docs Viewer fallbacks.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="glass-card rounded-3xl p-8 space-y-4 h-full">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Shared Resource Hub</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Explore worksheets, presentations, exams, and notes uploaded by fellow teachers. Search by topic, subject, and grade.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <div className="glass-card rounded-3xl p-8 space-y-4 h-full">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Structured Lesson Creator</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Generate structured lesson plans with objectives, main activities, practice exercises, homework, and teacher notes.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="glass-card rounded-3xl p-8 space-y-4 h-full">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Privacy Controls</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Full privacy options for your uploaded teaching resources. Toggle files between Public community access and Private mode.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="glass-card rounded-3xl p-8 space-y-4 h-full">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">One-Click Duplication</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Instantly duplicate successful lesson plans across different semesters or tweak them for different grade sections.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works - 4-Step Workflow */}
      <section id="workflow" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Simple Workflow
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                How EduNexus Hub Works in 4 Steps
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ScrollReveal animation="fade-left" delay={100}>
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative h-full">
                <span className="text-3xl font-black text-indigo-500/40 font-mono block mb-2">01</span>
                <h4 className="text-base font-bold text-white mb-2">Setup Schedule</h4>
                <p className="text-xs text-slate-400">
                  Configure your weekly class periods (e.g. Grade 9A, Grade 10B) across Monday to Friday.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-left" delay={200}>
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative h-full">
                <span className="text-3xl font-black text-purple-500/40 font-mono block mb-2">02</span>
                <h4 className="text-base font-bold text-white mb-2">Draft Lesson Plans</h4>
                <p className="text-xs text-slate-400">
                  Outline learning objectives, activities, practice tasks, homework, and teacher notes.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-left" delay={300}>
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative h-full">
                <span className="text-3xl font-black text-pink-500/40 font-mono block mb-2">03</span>
                <h4 className="text-base font-bold text-white mb-2">Attach Resources</h4>
                <p className="text-xs text-slate-400">
                  Link PDF worksheets and presentations directly from the community Shared Resource Hub.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-left" delay={400}>
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative h-full">
                <span className="text-3xl font-black text-emerald-500/40 font-mono block mb-2">04</span>
                <h4 className="text-base font-bold text-white mb-2">Teach & Track</h4>
                <p className="text-xs text-slate-400">
                  Access your schedule on any device and mark lessons completed as your week progresses.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Educator Testimonials */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up" delay={0}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Users className="w-3.5 h-3.5" />
              Educator Reviews
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Loved by Teachers Worldwide
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="glass-card rounded-3xl p-6 space-y-4 h-full">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &quot;EduNexus Hub saved me hours every week! Being able to see my weekly timetable with Grade 9A and Grade 10B period slots and attaching PDF worksheets directly is a game changer.&quot;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  SB
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Sarah Jenkins</h5>
                  <span className="text-[11px] text-slate-400">Biology Teacher • High School</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <div className="glass-card rounded-3xl p-6 space-y-4 h-full">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &quot;The inline document preview is seamless. I don&apos;t have to download files to view them anymore — I just click View and present them directly on the class projector.&quot;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                  MR
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Marcus Ramirez</h5>
                  <span className="text-[11px] text-slate-400">Mathematics Lead • Secondary</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="glass-card rounded-3xl p-6 space-y-4 h-full">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &quot;Sharing resources with fellow educators while having total control over public/private settings makes collaboration effortless. Highly recommended!&quot;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-xs">
                  EL
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Elena Lee</h5>
                  <span className="text-[11px] text-slate-400">Physical Sciences Educator</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about EduNexus Hub</p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <ScrollReveal key={idx} animation="fade-up" delay={idx * 100}>
                  <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-indigo-300 transition"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal animation="zoom-in" delay={0}>
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-purple-500/30 relative overflow-hidden space-y-6">
            <div className="space-y-3 relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to Supercharge Your Teaching Workflow?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                Join thousands of educators saving hours every week with structured lesson planning and shared resources.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl text-sm font-bold text-white gradient-bg-primary hover:opacity-95 shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all"
              >
                <span>Sign In with Demo Account</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">EduNexus Hub</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} EduNexus Hub. Built for Educators.
          </div>
        </div>
      </footer>
    </div>
  );
};
