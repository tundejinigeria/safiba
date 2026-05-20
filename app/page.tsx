import Link from "next/link";
import {
  Bell,
  Search,
  AlertTriangle,
  ShieldCheck,
  Users,
  Map,
  Wifi,
  Globe,
  EyeOff,
  Building2,
  ArrowRight,
} from "lucide-react";
import WaitlistForm from "@/src/components/WaitlistForm";

/* Nav */

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
      <span className="text-sm font-semibold tracking-widest uppercase text-neutral-900">
        Safiba
      </span>
      <div className="flex items-center gap-6 sm:gap-8">
        <a href="#features" className="hidden sm:block text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="hidden sm:block text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors">
          How it works
        </a>
        <a href="#waitlist" className="text-xs tracking-widest uppercase text-neutral-900 border border-neutral-300 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors">
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}

/* Hero */

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20 overflow-hidden bg-white">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Live indicator */}
      <div className="absolute top-24 right-8 sm:top-28 sm:right-16 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-xs text-red-600 tracking-widest uppercase">Live</span>
      </div>

      <div className="relative max-w-5xl">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-neutral-500">
          Nigeria's Safety Awareness Platform
        </p>
        <h1 className="text-[clamp(2.8rem,9vw,8.5rem)] font-semibold leading-[0.88] tracking-tight text-neutral-900">
          Know what's<br />
          happening<br />
          <em className="not-italic text-neutral-400">before it hits you.</em>
        </h1>
        <p className="mt-8 text-lg sm:text-xl font-light leading-relaxed text-neutral-600 max-w-xl">
          Real-time alerts. Missing persons. SOS. Verified communities.
          Trust-scored data. Built for 200 million Nigerians.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-3.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            Join the Waitlist
            <ArrowRight size={14} />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 px-8 py-3.5 text-sm hover:border-neutral-500 hover:text-neutral-900 transition-colors"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Problem */

function Problem() {
  return (
    <section className="border-t border-neutral-200 px-5 py-16 sm:px-8 sm:py-24 bg-neutral-100">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">The Problem</p>
        <h2 className="text-[clamp(1.8rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-tight text-neutral-900 max-w-3xl">
          Safety information in Nigeria is broken.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-3">
          {[
            { stat: "Hours", label: "after incidents", desc: "News channels report long after events unfold — when it's already too late to act." },
            { stat: "Rumours", label: "not facts", desc: "WhatsApp groups spread unverified information that causes panic and confusion." },
            { stat: "Unanswered", label: "emergency lines", desc: "Police emergency numbers go unanswered when Nigerians need help the most." },
          ].map(({ stat, label, desc }) => (
            <div key={stat} className="bg-white p-7 sm:p-8">
              <p className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-1">{stat}</p>
              <p className="text-xs tracking-widest uppercase text-neutral-500 mb-4">{label}</p>
              <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Solution */

const solutionFeatures = [
  {
    icon: Bell,
    title: "Real-time Alerts",
    desc: "Verified incident reports from your community, seconds after they happen.",
    iconColor: "text-blue-600",
  },
  {
    icon: Search,
    title: "Missing Persons",
    desc: "Coordinated search network with photo sharing and last-seen location tracking.",
    iconColor: "text-amber-500",
  },
  {
    icon: AlertTriangle,
    title: "SOS",
    desc: "One-tap emergency broadcast to your trusted circle and nearby responders.",
    iconColor: "text-red-500",
  },
  {
    icon: ShieldCheck,
    title: "Trust-scored Data",
    desc: "Every report is scored for credibility. No more rumours masquerading as facts.",
    iconColor: "text-emerald-600",
  },
];

function Solution() {
  return (
    <section className="border-t border-neutral-200 px-5 py-16 sm:px-8 sm:py-24 bg-white">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">The Solution</p>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-neutral-900">
              One platform.<br />
              <em className="not-italic text-neutral-400">All the truth.</em>
            </h2>
            <p className="mt-6 text-lg font-light leading-relaxed text-neutral-600">
              Safiba replaces fragmented WhatsApp groups, delayed news, and
              unanswered emergency lines with a single, trusted, real-time
              platform — community-powered and trust-scored.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {solutionFeatures.map(({ icon: Icon, title, desc, iconColor }) => (
              <div key={title} className="flex gap-4 border border-neutral-200 bg-neutral-50 p-5 hover:border-neutral-300 transition-colors">
                <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
                <div>
                  <p className="text-sm font-semibold text-neutral-900 mb-1">{title}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features  */

const featureList = [
  { number: "01", icon: Users, title: "Verified Communities", desc: "Join location-based safety groups verified by community leaders. No anonymous trolls.", iconColor: "text-indigo-500" },
  { number: "02", icon: Map, title: "Incident Heatmaps", desc: "See where incidents are clustering in real time. Know which routes to avoid.", iconColor: "text-rose-500" },
  { number: "03", icon: Wifi, title: "Offline-first", desc: "Core features work on low bandwidth. Designed for Nigerian network realities.", iconColor: "text-teal-500" },
  { number: "04", icon: Globe, title: "Multi-language", desc: "English, Pidgin, Yoruba, Igbo, Hausa. Safety information in your language.", iconColor: "text-violet-500" },
  { number: "05", icon: EyeOff, title: "Anonymous Reporting", desc: "Report sensitive incidents without revealing your identity. Your safety first.", iconColor: "text-orange-500" },
];

function Features() {
  return (
    <section id="features" className="border-t border-neutral-200 px-5 py-16 sm:px-8 sm:py-24 bg-neutral-100">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">Features</p>
        <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-neutral-900 mb-14">
          Built for how Nigerians<br />actually communicate.
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map(({ number, icon: Icon, title, desc, iconColor }) => (
            <div key={number} className="border border-neutral-200 bg-white p-6 hover:border-neutral-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Icon size={16} className={iconColor} />
                <p className="text-xs text-neutral-400 font-mono">{number}</p>
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* How it works */

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-neutral-200 px-5 py-16 sm:px-8 sm:py-24 bg-white">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">How it works</p>
        <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-neutral-900 mb-14">
          Simple. Fast. Trusted.
        </h2>
        <div className="grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-4">
          {[
            { step: "1", title: "Join your community", desc: "Sign up and connect to verified safety groups in your area." },
            { step: "2", title: "Receive alerts", desc: "Get real-time notifications about incidents near you — before they spread." },
            { step: "3", title: "Report & verify", desc: "Submit reports. Community members verify. Trust scores update automatically." },
            { step: "4", title: "Stay safe", desc: "Make informed decisions. Share with family. Escalate when needed." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white p-6 sm:p-8">
              <p className="text-4xl font-semibold text-neutral-200 mb-6 font-mono">{step}</p>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/*  Stats */

function Stats() {
  return (
    <section className="border-t border-neutral-200 px-5 py-16 sm:px-8 sm:py-24 bg-neutral-100">
      <div className="max-w-6xl">
        <div className="grid grid-cols-2 gap-px bg-neutral-200 sm:grid-cols-4">
          {[
            { value: "200M+", label: "Nigerians who deserve better" },
            { value: "36", label: "States to cover" },
            { value: "0", label: "Rumours tolerated" },
            { value: "24/7", label: "Real-time coverage" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white px-6 py-8 sm:px-8 sm:py-10">
              <p className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-2">{value}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Waitlist  */

function Waitlist() {
  return (
    <section id="waitlist" className="border-t border-neutral-200 px-5 py-16 sm:px-8 sm:py-24 bg-white">
      <div className="max-w-2xl">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-neutral-500">Early Access</p>
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.95] tracking-tight text-neutral-900 mb-6">
          Be first to know<br />
          <em className="not-italic text-neutral-400">when we launch.</em>
        </h2>
        <p className="text-neutral-600 mb-10 text-lg font-light leading-relaxed">
          We're building in public. Join the waitlist and help shape Nigeria's
          first community-powered safety platform.
        </p>
        <WaitlistForm />
      </div>
    </section>
  );
}

/* Footer */

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 px-5 py-8 sm:px-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold tracking-widest uppercase text-neutral-900">Safiba</p>
        <p className="text-xs text-neutral-500 mt-0.5">Nigeria's Safety Awareness Platform</p>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="text-xs text-neutral-500 tracking-widest uppercase hover:text-neutral-900 transition-colors">Twitter</a>
        <a href="#" className="text-xs text-neutral-500 tracking-widest uppercase hover:text-neutral-900 transition-colors">Instagram</a>
        <a href="#" className="text-xs text-neutral-500 tracking-widest uppercase hover:text-neutral-900 transition-colors">Contact</a>
      </div>
      <p className="text-xs text-neutral-400">© {new Date().getFullYear()} Safiba. All rights reserved.</p>
    </footer>
  );
}

/*  Page  */

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <Stats />
      <Waitlist />
      <Footer />
    </div>
  );
}
