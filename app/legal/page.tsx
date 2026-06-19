import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Legal | Safiba",
  description:
    "Legal information, terms of service, and privacy policy for Safiba — a community-powered safety awareness platform by Tundeji Technologies Ltd.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-6 sm:px-12">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <Image src="/safiba-logo.svg" alt="Safiba" width={26} height={30} className="h-6 w-auto" />
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-gray-900 mb-4">
            Legal Information
          </h1>
          <p className="text-[15px] text-gray-500 mb-12 leading-relaxed">
            This page provides legal, corporate, and regulatory information about Safiba and its parent company. By using Safiba, you agree to the terms outlined below.
          </p>

          {/* Table of Contents */}
          <nav className="mb-14 bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-3">On this page</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { href: "#company-info", label: "Company Information" },
                { href: "#ownership", label: "Ownership Statement" },
                { href: "#terms", label: "Terms of Service" },
                { href: "#privacy", label: "Privacy & Data Handling" },
                { href: "#acceptable-use", label: "Acceptable Use Policy" },
                { href: "#disclaimer", label: "Disclaimer & Limitation of Liability" },
                { href: "#contact", label: "Contact" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-[14px] text-orange-500 hover:underline">{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Company Information ── */}
          <section id="company-info" className="mb-14">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Company Information</h2>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Product</dt>
                  <dd className="text-[15px] text-gray-900 font-medium">Safiba</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Parent Company</dt>
                  <dd className="text-[15px] text-gray-900 font-medium">Tundeji Technologies Ltd</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1">CAC Registration No.</dt>
                  <dd className="text-[15px] text-gray-900 font-medium">RC9562371</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Country of Incorporation</dt>
                  <dd className="text-[15px] text-gray-900 font-medium">Nigeria</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Registered Address</dt>
                  <dd className="text-[15px] text-gray-900 font-medium">No 40, Lane D, Jeje Apete, Ibadan, Oyo State, Nigeria</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Phone</dt>
                  <dd className="text-[15px] text-gray-900 font-medium">09066535939</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Email</dt>
                  <dd className="text-[15px] text-gray-900 font-medium">support@safiba.com</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* ── Ownership Statement ── */}
          <section id="ownership" className="mb-14">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Ownership Statement</h2>
            <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
              <p>
                Safiba is a product developed, owned, and operated by <strong>Tundeji Technologies Ltd</strong>, a company duly registered with the Corporate Affairs Commission (CAC) of the Federal Republic of Nigeria under registration number <strong>RC9562371</strong>.
              </p>
              <p>
                All intellectual property, trademarks, and rights associated with the Safiba platform — including its mobile applications, web services, APIs, branding, and related technologies — are the exclusive property of Tundeji Technologies Ltd.
              </p>
              <p>
                The Safiba name, logo, and associated marks may not be reproduced, distributed, or used in any manner without prior written consent from Tundeji Technologies Ltd.
              </p>
            </div>
          </section>

          {/* ── Terms of Service ── */}
          <section id="terms" className="mb-14">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Terms of Service</h2>
            <p className="text-[13px] text-gray-400 mb-4">Last updated: June 2026</p>
            <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
              <p>
                By accessing or using the Safiba platform (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use of the Service immediately.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">1. Description of Service</h3>
              <p>
                Safiba is a community-powered safety awareness platform that enables users to report, verify, and receive real-time safety alerts within their neighbourhoods across Nigeria. The Service includes incident reporting, missing persons alerts, SOS emergency features, safety community groups, and route safety checks.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">2. Eligibility</h3>
              <p>
                You must be at least 16 years of age to use Safiba. By creating an account, you represent that you meet this requirement and that the information you provide is accurate and complete.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">3. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised access or use of your account.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">4. User-Generated Content</h3>
              <p>
                Users may submit safety reports, incident descriptions, photos, location data, and other content. You retain ownership of your content but grant Tundeji Technologies Ltd a non-exclusive, royalty-free licence to use, display, and distribute such content for the purpose of operating and improving the Service.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">5. Verification System</h3>
              <p>
                Safiba employs a community-based verification system where reports are confirmed by nearby users. While we strive for accuracy, we cannot guarantee the completeness or correctness of user-submitted reports. Verified status indicates community consensus, not official confirmation by law enforcement or government authorities.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">6. Modifications to Service</h3>
              <p>
                Tundeji Technologies Ltd reserves the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice. We may also update these Terms periodically, and continued use of the platform constitutes acceptance of revised terms.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">7. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Oyo State, Nigeria.
              </p>
            </div>
          </section>

          {/* ── Privacy & Data Handling ── */}
          <section id="privacy" className="mb-14">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Privacy &amp; Data Handling</h2>
            <p className="text-[13px] text-gray-400 mb-4">Last updated: June 2026</p>
            <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
              <p>
                At Safiba, your privacy and safety are equally important. This section outlines how we collect, use, store, and protect your personal data in compliance with the Nigeria Data Protection Regulation (NDPR).
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account information:</strong> Name, phone number, email address, and profile photo.</li>
                <li><strong>Location data:</strong> GPS coordinates when you use real-time features such as reporting incidents, SOS alerts, or checking route safety. Location data is only collected when you actively use these features or have granted background location permission.</li>
                <li><strong>Device information:</strong> Device type, operating system version, and unique device identifiers for push notifications and security.</li>
                <li><strong>Usage data:</strong> Interaction patterns, feature usage, and crash reports to improve the Service.</li>
                <li><strong>User-submitted content:</strong> Incident reports, photos, descriptions, and community confirmations.</li>
              </ul>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">How We Use Your Data</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>To deliver real-time safety alerts relevant to your locations.</li>
                <li>To enable the community verification system and trust scoring.</li>
                <li>To process SOS alerts and share your emergency location with your trusted contacts.</li>
                <li>To detect and prevent false reporting, fraud, and abuse.</li>
                <li>To send transactional messages (OTPs, account alerts) via SMS and push notifications.</li>
                <li>To improve and personalise the Service.</li>
              </ul>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">Data Sharing</h3>
              <p>
                We do not sell your personal data. We may share limited data with:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Trusted service providers:</strong> For SMS delivery (e.g., Termii), push notifications, and cloud hosting — all bound by data processing agreements.</li>
                <li><strong>Law enforcement:</strong> Only when required by a valid court order or where there is an imminent threat to life.</li>
                <li><strong>Community members:</strong> Your reports are visible to nearby users, but personal identifying information (phone number, full name) is never publicly displayed without your consent.</li>
              </ul>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">Data Retention</h3>
              <p>
                We retain your account data for as long as your account is active. Incident reports are retained to maintain the safety map and historical awareness. You may request deletion of your account and associated data at any time by contacting <a href="mailto:support@safiba.com" className="text-orange-500 hover:underline">support@safiba.com</a>.
              </p>

              <h3 className="text-[16px] font-semibold text-gray-900 pt-2">Your Rights</h3>
              <p>
                Under the NDPR, you have the right to access, correct, or delete your personal data. You may also withdraw consent for location tracking at any time through your device settings.
              </p>
            </div>
          </section>

          {/* ── Acceptable Use Policy ── */}
          <section id="acceptable-use" className="mb-14">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Acceptable Use Policy</h2>
            <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
              <p>
                Safiba exists to protect communities. To maintain trust and safety on the platform, users agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Submit false, misleading, or fabricated safety reports.</li>
                <li>Use the platform to harass, threaten, stalk, or intimidate any individual.</li>
                <li>Impersonate another person, organisation, or law enforcement officer.</li>
                <li>Use the SOS feature for non-emergency purposes or to generate false alarms.</li>
                <li>Attempt to manipulate the trust score or verification system through coordinated inauthentic behaviour.</li>
                <li>Use the platform to facilitate criminal activity or incite violence.</li>
                <li>Scrape, harvest, or collect data from the platform without authorisation.</li>
                <li>Interfere with or disrupt the Service&apos;s infrastructure or security mechanisms.</li>
              </ul>
              <p>
                Violations may result in account suspension, permanent ban, trust score reduction, or referral to law enforcement where appropriate.
              </p>
            </div>
          </section>

          {/* ── Disclaimer & Limitation of Liability ── */}
          <section id="disclaimer" className="mb-14">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Disclaimer &amp; Limitation of Liability</h2>
            <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
              <p>
                <strong>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;</strong> While Safiba strives to provide accurate and timely safety information, we cannot guarantee:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>The accuracy, completeness, or timeliness of user-submitted reports.</li>
                <li>Uninterrupted or error-free operation of the platform.</li>
                <li>That the information provided will prevent harm or ensure personal safety.</li>
              </ul>
              <p>
                <strong>Safiba is not a replacement for emergency services.</strong> In a life-threatening situation, always contact the relevant emergency services (e.g., Nigeria Police — 112, NSCDC, FRSC) in addition to using the SOS feature.
              </p>
              <p>
                To the maximum extent permitted by Nigerian law, Tundeji Technologies Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to damages resulting from reliance on safety reports, loss of data, or service interruptions.
              </p>
              <p>
                Our total liability for any claim related to the Service shall not exceed the amount you paid to us (if any) in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* ── Contact ── */}
          <section id="contact">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Contact</h2>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              For legal inquiries, data requests, complaints, or general correspondence, please contact us at:
            </p>
            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <p className="text-[14px] text-gray-700 leading-loose">
                <strong>Tundeji Technologies Ltd</strong><br />
                No 40, Lane D, Jeje Apete, Ibadan, Oyo State, Nigeria<br />
                Phone: <a href="tel:09066535939" className="text-orange-500 hover:underline">09066535939</a><br />
                Email: <a href="mailto:support@safiba.com" className="text-orange-500 hover:underline">support@safiba.com</a>
              </p>
            </div>
            <p className="mt-4 text-[13px] text-gray-400">
              We aim to respond to all inquiries within 48 hours on business days.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 py-10 sm:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[12px] text-gray-600">
            © {new Date().getFullYear()} Tundeji Technologies Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
