import Image from "next/image";
import {
  Bell,
  Search,
  AlertTriangle,
  ShieldCheck,
  Users,
  Map,
  MapPin,
  Navigation,
  Shield,
  ArrowRight,
  CheckCircle,
  Smartphone,
} from "lucide-react";
import WaitlistForm from "@/src/components/WaitlistForm";

/* ─────────────────────────────────────────
   NAV
───────────────────────────────────────── */
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 sm:px-12 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <Image src="/safiba-logo.svg" alt="Safiba" width={26} height={30} className="h-6 w-auto" />
      </div>
      <div className="hidden sm:flex items-center gap-9">
        <a href="#features" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Features</a>
        <a href="#how-it-works" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
        <a href="#waitlist" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Early Access</a>
      </div>
      <a
        href="#waitlist"
        className="text-[13px] font-semibold bg-orange-500 text-white px-5 py-2.5 rounded-full hover:bg-gray-700 transition-colors"
      >
        Get Early Access
      </a>
    </nav>
  );
}

/* Hero */

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 sm:px-12 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(251,146,60,0.06),transparent)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto w-full">
        {/* Live pill */}
        <div className="inline-flex items-center gap-2.5 mb-10 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400" />
          </span>
          <span className="text-orange-600 text-[12px] font-semibold tracking-wide">Nigeria&apos;s Community-Powered Safety Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(3rem,9vw,8.5rem)] font-extrabold leading-[0.88] tracking-[-0.03em] text-gray-900">
          Know what&apos;s<br />
          happening<br />
          <span className="text-orange-400">around you.</span>
        </h1>

        <p className="mt-8 text-[17px] sm:text-[19px] text-gray-500 leading-relaxed max-w-xl font-normal">
          Real-time safety alerts from your neighbourhood. Report incidents, find missing persons, trigger SOS — all verified by your community.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-full text-[15px] font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
          >
            Get Early Access
            <ArrowRight size={15} />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-8 py-4 rounded-full text-[15px] font-medium hover:bg-gray-100 transition-colors border border-gray-200"
          >
            See how it works
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-10">
          {[
            { v: "200M+", l: "Nigerians who deserve better" },
            { v: "36+1", l: "States + FCT covered" },
            { v: "24/7", l: "Real-time coverage" },
          ].map(({ v, l }) => (
            <div key={l}>
              <p className="text-[22px] font-bold text-gray-900">{v}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Problem */

function Problem() {
  return (
    <section className="bg-gray-50 border-t border-gray-100 px-6 py-20 sm:px-12 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="text-orange-500 text-[13px] font-semibold mb-4 uppercase tracking-wider">The Problem</p>
        <h2 className="text-[clamp(2rem,5vw,3.8rem)] font-extrabold leading-[0.92] tracking-tight text-gray-900 max-w-3xl mb-14">
          Safety information in Nigeria is broken.
        </h2>
        <div className="grid grid-cols-1 gap-px bg-gray-200 rounded-2xl overflow-hidden sm:grid-cols-3">
          {[
            {
              stat: "Hours",
              label: "after incidents",
              desc: "News channels report long after events unfold — when it's already too late to act.",
              accent: "border-l-orange-400",
            },
            {
              stat: "Rumours",
              label: "not facts",
              desc: "WhatsApp groups spread unverified information that causes panic and confusion.",
              accent: "border-l-amber-400",
            },
            {
              stat: "Unanswered",
              label: "emergency lines",
              desc: "Police emergency numbers go unanswered when Nigerians need help the most.",
              accent: "border-l-red-400",
            },
          ].map(({ stat, label, desc, accent }) => (
            <div key={stat} className={`bg-white p-8 border-l-4 ${accent}`}>
              <p className="text-[2.5rem] font-extrabold text-gray-900 mb-1 leading-none">{stat}</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-5">{label}</p>
              <p className="text-[14px] text-gray-500 leading-relaxed">{desc}</p>
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
    title: "Real-time Safety Alerts",
    desc: "Get notified about incidents near your home, work, or school — within seconds of being reported.",
  },
  {
    icon: Search,
    title: "Missing Persons Network",
    desc: "Report and find missing people with photos, last-seen location on map, and proximity-based notifications.",
  },
  {
    icon: AlertTriangle,
    title: "One-Tap SOS",
    desc: "Emergency panic button that shares your live location with your trusted contacts instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Community Verification",
    desc: "2 confirmations from nearby users = verified alert. False reports get flagged and hidden automatically.",
  },
];

function Solution() {
  return (
    <section className="bg-white border-t border-gray-100 px-6 py-20 sm:px-12 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="text-orange-500 text-[13px] font-semibold mb-4 uppercase tracking-wider">The Solution</p>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[0.92] tracking-tight text-gray-900">
              Your neighbourhood.<br />
              <span className="text-gray-300">Your safety network.</span>
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-gray-500">
              Safiba connects you with people in your area to share real-time safety awareness. No more relying on delayed news or unverified WhatsApp forwards.
            </p>
            <a href="#waitlist" className="mt-8 inline-flex items-center gap-2 text-orange-500 text-[14px] font-semibold hover:gap-3 transition-all">
              Join the waitlist <ArrowRight size={14} />
            </a>
          </div>
          <div className="flex flex-col gap-3">
            {solutionFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-gray-50 border border-gray-100 p-5 hover:border-orange-200 hover:bg-orange-50/30 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 mb-1">{title}</p>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
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
  { number: "01", icon: Users, title: "Safety Communities", desc: "Join or create neighbourhood groups — street, estate, school, or workplace. Share alerts with people who matter." },
  { number: "02", icon: Map, title: "Safety Map", desc: "See incidents on a live map with severity-colored markers. Check route safety before you travel." },
  { number: "03", icon: MapPin, title: "Pin-Drop Location", desc: "Report incidents by dropping a pin on the exact location. No typing addresses — just move the map." },
  { number: "04", icon: Navigation, title: "Route Safety Check", desc: "Planning a trip? Check if your route passes through areas with recent incidents before you leave." },
  { number: "05", icon: Shield, title: "Trust Scores", desc: "Every user has a trust score. Accurate reports increase it. False reports decrease it. No more rumours." },
  { number: "06", icon: CheckCircle, title: "2-Confirmation Verification", desc: "Alerts become 'verified' after 2 nearby users confirm. Unverified alerts show lower visual weight." },
];

function Features() {
  return (
    <section id="features" className="bg-gray-50 border-t border-gray-100 px-6 py-20 sm:px-12 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="text-orange-500 text-[13px] font-semibold mb-4 uppercase tracking-wider">Features</p>
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[0.92] tracking-tight text-gray-900 mb-14">
          Built for how Nigerians<br />
          <span className="text-gray-400">actually live.</span>
        </h2>
        <div className="grid grid-cols-1 gap-px bg-gray-200 rounded-2xl overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map(({ number, icon: Icon, title, desc }) => (
            <div key={number} className="bg-white p-7 hover:bg-orange-50/40 transition-colors group">
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Icon size={16} className="text-orange-500" />
                </div>
                <span className="text-[11px] text-gray-300 font-mono">{number}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
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
    <section id="how-it-works" className="bg-white border-t border-gray-100 px-6 py-20 sm:px-12 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="text-orange-500 text-[13px] font-semibold mb-4 uppercase tracking-wider">How it works</p>
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[0.92] tracking-tight text-gray-900 mb-14">
          Simple. Fast. Trusted.
        </h2>
        <div className="grid grid-cols-1 gap-px bg-gray-200 rounded-2xl overflow-hidden sm:grid-cols-4">
          {[
            {
              step: "1",
              title: "Add your locations",
              desc: "Pin your home, work, and places you care about on the map. Set your alert radius.",
              color: "text-orange-400",
            },
            {
              step: "2",
              title: "Get real-time alerts",
              desc: "See safety incidents happening near your locations — reported and verified by your community.",
              color: "text-amber-400",
            },
            {
              step: "3",
              title: "Report & confirm",
              desc: "See something? Drop a pin and report it. Others nearby confirm — 2 confirmations = verified.",
              color: "text-orange-400",
            },
            {
              step: "4",
              title: "Stay safe together",
              desc: "Join communities, check route safety, trigger SOS in emergencies. Safety in numbers.",
              color: "text-amber-400",
            },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="bg-white p-7 sm:p-8 hover:bg-orange-50/30 transition-colors group">
              <p className={`text-[3.5rem] font-extrabold ${color} mb-6 font-mono leading-none opacity-50 group-hover:opacity-100 transition-opacity`}>{step}</p>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
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
    <section className="bg-gray-50 border-t border-gray-100 px-6 py-16 sm:px-12 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-px bg-gray-200 rounded-2xl overflow-hidden sm:grid-cols-4">
          {[
            { value: "200M+", label: "Nigerians who deserve better" },
            { value: "36+1", label: "States + FCT covered" },
            { value: "2", label: "Confirmations to verify" },
            { value: "24/7", label: "Real-time coverage" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white px-7 py-8 sm:px-8 sm:py-10">
              <p className="text-[2rem] sm:text-[2.5rem] font-extrabold text-gray-900 mb-2 leading-none">{value}</p>
              <p className="text-[13px] text-gray-400 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Early Access / Waitlist */

function Waitlist() {
  return (
    <section id="waitlist" className="bg-white border-t border-gray-100 px-6 py-24 sm:px-12 sm:py-36">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-orange-500 text-[13px] font-semibold mb-4 uppercase tracking-wider">Early Access</p>
        <h2 className="text-[clamp(2.4rem,7vw,6rem)] font-extrabold leading-[0.88] tracking-tight text-gray-900">
          Be the first to know<br />
          <span className="text-orange-400">when we launch.</span>
        </h2>
        <p className="mt-6 text-[16px] text-gray-500 leading-relaxed max-w-lg mx-auto">
          We&apos;re in private testing. Join the waitlist to get early access and help shape Nigeria&apos;s first community-powered safety platform.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 text-[13px] text-gray-500">
          {["Early access before public launch", "Shape the product with your feedback", "Free for individual users"].map((b) => (
            <div key={b} className="flex items-center gap-2">
              <CheckCircle size={13} className="text-green-500 shrink-0" />
              {b}
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-sm mx-auto">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}

/* Footer */

function Footer() {
  return (
    <footer className="bg-gray-900 px-6 py-14 sm:px-12 sm:py-16">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-3">
          <Image src="/safiba-logo.svg" alt="Safiba" width={28} height={32} className="h-7 w-auto brightness-0 invert" />
          <p className="text-[14px] text-gray-400 text-center">
            Nigeria&apos;s Community-Powered Safety Platform
          </p>
        </div>

        {/* Address + phone + socials */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-10">
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <MapPin size={13} className="shrink-0" />
            <span>No 40, Lane D, Jeje Apete, Ibadan, Oyo State, Nigeria</span>
          </div>
          <a href="tel:09066535939" className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-orange-400 transition-colors">
            <Smartphone size={13} className="shrink-0" />
            <span>09066535939</span>
          </a>
          <a href="mailto:support@safiba.com" className="text-[13px] text-gray-500 hover:text-orange-400 transition-colors">
            support@safiba.com
          </a>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[13px] text-gray-500 hover:text-orange-400 transition-colors">Twitter</a>
            <a href="#" className="text-[13px] text-gray-500 hover:text-orange-400 transition-colors">Instagram</a>
            <a href="#" className="text-[13px] text-gray-500 hover:text-orange-400 transition-colors">Contact</a>
            <a href="/legal" className="text-[13px] text-gray-500 hover:text-orange-400 transition-colors">Legal</a>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="w-full max-w-xs border-t border-gray-700 pt-6">
          <p className="text-[12px] text-gray-600 text-center">
            © {new Date().getFullYear()} Safiba. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/*  Page  */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Safiba",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Android, iOS",
  description:
    "Nigeria's community-powered safety platform. Real-time safety alerts, missing persons reports, SOS emergency features, and verified community safety data.",
  url: "https://safiba.com",
  author: {
    "@type": "Organization",
    name: "Tundeji Technologies Ltd",
    url: "https://safiba.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "No 40, Lane D, Jeje Apete",
      addressLocality: "Ibadan",
      addressRegion: "Oyo State",
      addressCountry: "NG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+234-906-653-5939",
      email: "support@safiba.com",
      contactType: "customer support",
      availableLanguage: "English",
    },
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    description: "Free for individual users",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <Stats />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
