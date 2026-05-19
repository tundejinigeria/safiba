import Link from "next/link";

/* ── Nav ──────────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
      <span className="text-sm font-semibold tracking-widest uppercase text-white">
        Safiba
      </span>
      <div className="flex items-center gap-6 sm:gap-8">
        <a href="#features" className="hidden sm:block text-xs tracking-widest uppercase text-neutral-400 hover:text-white transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="hidden sm:block text-xs tracking-widest uppercase text-neutral-400 hover:text-white transition-colors">
          How it works
        </a>
        <a href="#waitlist" className="text-xs tracking-widest uppercase text-white border border-white/30 px-4 py-2 hover:bg-white hover:text-black transition-colors">
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20 overflow-hidden">
      {/* Background grid — subtle map-like texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Pulsing alert dot — top right */}
      <div className="absolute top-24 right-8 sm:top-28 sm:right-16 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-xs text-red-400 tracking-widest uppercase">Live</span>
      </div>

      <div className="relative max-w-5xl">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-neutral-500">
          Nigeria's Safety Intelligence Platform
        </p>
        <h1 className="text-[clamp(2.8rem,9vw,8.5rem)] font-semibold leading-[0.88] tracking-tight text-white">
          Know what's<br />
          happening<br />
          <em className="not-italic text-neutral-500">before it hits you.</em>
        </h1>
        <p className="mt-8 text-lg sm:text-xl font-light leading-relaxed text-neutral-400 max-w-xl">
          Real-time alerts. Missing persons. SOS. Verified communities.
          Trust-scored data. Built for 200 million Nigerians.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Join the Waitlist
            <span>→</span>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 border border-neutral-700 text-neutral-300 px-8 py-3.5 text-sm hover:border-neutral-500 hover:text-white transition-colors"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Problem ──────────────────────────────────────────────────────────────── */

function Problem() {
  return (
    <section className="border-t border-neutral-900 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">
          The Problem
        </p>
        <h2 className="text-[clamp(1.8rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-tight text-white max-w-3xl">
          Safety information in Nigeria is broken.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-px bg-neutral-900 sm:grid-cols-3">
          {[
            {
              stat: "Hours",
              label: "after incidents",
              desc: "News channels report long after events unfold — when it's already too late to act.",
            },
            {
              stat: "Rumours",
              label: "not facts",
              desc: "WhatsApp groups spread unverified information that causes panic and confusion.",
            },
            {
              stat: "Unanswered",
              label: "emergency lines",
              desc: "Police emergency numbers go unanswered when Nigerians need help the most.",
            },
          ].map(({ stat, label, desc }) => (
            <div key={stat} className="bg-black p-7 sm:p-8">
              <p className="text-3xl sm:text-4xl font-semibold text-white mb-1">{stat}</p>
              <p className="text-xs tracking-widest uppercase text-neutral-500 mb-4">{label}</p>
              <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Solution ─────────────────────────────────────────────────────────────── */

function Solution() {
  return (
    <section className="border-t border-neutral-900 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">
          The Solution
        </p>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-white">
              One platform.<br />
              <em className="not-italic text-neutral-500">All the truth.</em>
            </h2>
            <p className="mt-6 text-lg font-light leading-relaxed text-neutral-400">
              Safiba replaces fragmented WhatsApp groups, delayed news, and
              unanswered emergency lines with a single, trusted, real-time
              platform — community-powered and trust-scored.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { icon: "🔴", title: "Real-time Alerts", desc: "Verified incident reports from your community, seconds after they happen." },
              { icon: "🔍", title: "Missing Persons", desc: "Coordinated search network with photo sharing and last-seen location tracking." },
              { icon: "🆘", title: "SOS", desc: "One-tap emergency broadcast to your trusted circle and nearby responders." },
              { icon: "✅", title: "Trust-scored Data", desc: "Every report is scored for credibility. No more rumours masquerading as facts." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 border border-neutral-800 p-5 hover:border-neutral-700 transition-colors">
                <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{title}</p>
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

/* ── Features ─────────────────────────────────────────────────────────────── */

function Features() {
  return (
    <section id="features" className="border-t border-neutral-900 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">
          Features
        </p>
        <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-white mb-14">
          Built for how Nigerians<br />actually communicate.
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              number: "01",
              title: "Verified Communities",
              desc: "Join location-based safety groups verified by community leaders. No anonymous trolls.",
            },
            {
              number: "02",
              title: "Incident Heatmaps",
              desc: "See where incidents are clustering in real time. Know which routes to avoid.",
            },
            {
              number: "03",
              title: "Offline-first",
              desc: "Core features work on low bandwidth. Designed for Nigerian network realities.",
            },
            {
              number: "04",
              title: "Multi-language",
              desc: "English, Pidgin, Yoruba, Igbo, Hausa. Safety information in your language.",
            },
            {
              number: "05",
              title: "Anonymous Reporting",
              desc: "Report sensitive incidents without revealing your identity. Your safety first.",
            },
            {
              number: "06",
              title: "Authority Integration",
              desc: "Direct escalation to verified police, FRSC, and emergency services channels.",
            },
          ].map(({ number, title, desc }) => (
            <div key={number} className="border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
              <p className="text-xs text-neutral-600 font-mono mb-4">{number}</p>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────────────────── */

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-neutral-900 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-6xl">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-neutral-500">
          How it works
        </p>
        <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-white mb-14">
          Simple. Fast. Trusted.
        </h2>
        <div className="grid grid-cols-1 gap-px bg-neutral-900 sm:grid-cols-4">
          {[
            { step: "1", title: "Join your community", desc: "Sign up and connect to verified safety groups in your area." },
            { step: "2", title: "Receive alerts", desc: "Get real-time notifications about incidents near you — before they spread." },
            { step: "3", title: "Report & verify", desc: "Submit reports. Community members verify. Trust scores update automatically." },
            { step: "4", title: "Stay safe", desc: "Make informed decisions. Share with family. Escalate when needed." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-black p-6 sm:p-8">
              <p className="text-4xl font-semibold text-neutral-800 mb-6 font-mono">{step}</p>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ────────────────────────────────────────────────────────────────── */

function Stats() {
  return (
    <section className="border-t border-neutral-900 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-6xl">
        <div className="grid grid-cols-2 gap-px bg-neutral-900 sm:grid-cols-4">
          {[
            { value: "200M+", label: "Nigerians who deserve better" },
            { value: "36", label: "States to cover" },
            { value: "0", label: "Rumours tolerated" },
            { value: "24/7", label: "Real-time coverage" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-black px-6 py-8 sm:px-8 sm:py-10">
              <p className="text-3xl sm:text-4xl font-semibold text-white mb-2">{value}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Waitlist ─────────────────────────────────────────────────────────────── */

function Waitlist() {
  return (
    <section id="waitlist" className="border-t border-neutral-900 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <p className="mb-4 text-xs tracking-[0.3em] uppercase text-neutral-500">
          Early Access
        </p>
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-[0.95] tracking-tight text-white mb-6">
          Be first to know<br />
          <em className="not-italic text-neutral-500">when we launch.</em>
        </h2>
        <p className="text-neutral-400 mb-10 text-lg font-light leading-relaxed">
          We're building in public. Join the waitlist and help shape Nigeria's
          first community-powered safety platform.
        </p>
        <form className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-600 transition-colors"
          />
          <button
            type="submit"
            className="bg-white text-black px-8 py-3 text-sm font-medium hover:bg-neutral-200 transition-colors shrink-0"
          >
            Join Waitlist
          </button>
        </form>
        <p className="mt-4 text-xs text-neutral-600">
          No spam. No noise. Just the launch date and early access.
        </p>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-neutral-900 px-5 py-8 sm:px-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold tracking-widest uppercase text-white">Safiba</p>
        <p className="text-xs text-neutral-600 mt-0.5">Nigeria's Safety Intelligence Platform</p>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="text-xs text-neutral-600 tracking-widest uppercase hover:text-neutral-300 transition-colors">Twitter</a>
        <a href="#" className="text-xs text-neutral-600 tracking-widest uppercase hover:text-neutral-300 transition-colors">Instagram</a>
        <a href="#" className="text-xs text-neutral-600 tracking-widest uppercase hover:text-neutral-300 transition-colors">Contact</a>
      </div>
      <p className="text-xs text-neutral-700">© {new Date().getFullYear()} Safiba. All rights reserved.</p>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
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
