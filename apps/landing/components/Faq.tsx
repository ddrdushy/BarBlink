'use client';

const faqs = [
  {
    q: 'When does Barblink launch in KL?',
    a: "We're launching in Kuala Lumpur in the coming months. Join the waitlist and you'll be the first to get a TestFlight invite and App Store download link the day we go live.",
  },
  {
    q: 'Is it free?',
    a: "Yes. The core app — feed, check-ins, DJ profiles, crowd meter, crew tracking, nightlife passport, and leaderboards — is 100% free. Premium features like Bar Buddy will come later, after we hit our first milestone.",
  },
  {
    q: 'Why 18+ only?',
    a: "Barblink is a nightlife platform centred on bars and clubs. Age verification is the first screen when you open the app — non-negotiable. You'll be asked for your date of birth before you see a single feature.",
  },
  {
    q: 'How does the crowd meter actually work?',
    a: 'Every check-in at a venue in the last 3 hours counts towards that venue\'s crowd level. The thresholds are set per venue based on real capacity, so a "packed" Kyo Bar is different from a "packed" rooftop lounge. Redis + Socket.io = live updates, no refresh needed.',
  },
  {
    q: "Do I need to scan a QR code to check in?",
    a: "No. Check-in is a one-tap status update on the venue page. Open the app, pick the bar, tap 'I'm Here'. Done. No scanning, no staff interaction, no awkward fumbling at the bar.",
  },
  {
    q: 'Is my location public?',
    a: "No. Only your Trusted Circle (a private list of close friends you pick) sees your real-time location. Regular followers see the venue name only. You can disable location sharing entirely and still check in if you prefer.",
  },
  {
    q: 'Which cities are supported?',
    a: 'Phase 1 is Kuala Lumpur only — Bukit Bintang, KLCC, Bangsar, Mont Kiara, TREC, Changkat, Hartamas, Chinatown. We go deep on KL first, then expand.',
  },
  {
    q: "I'm a DJ — how do I get on Barblink?",
    a: "You're already on it. Barblink auto-creates DJ profiles from the venues you're booked at. Phase 2 lets you claim your profile, add photos, music samples, and manage your gigs directly.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="relative py-28 sm:py-36 bg-bg-deep/30 border-y border-white/[0.04]">
      <div className="container-md">
        <div className="text-center mb-14">
          <div className="eyebrow mb-4">Ask us anything</div>
          <h2 className="section-title">Frequently asked.</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl glass p-0 overflow-hidden hover:border-neon/30 transition"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <summary className="list-none cursor-pointer px-6 py-5 flex items-center justify-between gap-4">
                <span className="font-display font-bold text-white text-[16px] sm:text-[17px] tracking-tight">
                  {f.q}
                </span>
                <div className="chev w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5L7 9L11 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </summary>
              <div className="px-6 pb-6 text-ink-mute text-[14.5px] leading-relaxed -mt-1">
                {f.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="text-ink-mute text-[13.5px]">
            Still have questions?{' '}
            <a href="mailto:hello@barblink.com" className="text-neon-bright hover:text-white transition">
              hello@barblink.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
