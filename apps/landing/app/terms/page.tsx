export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg py-20">
      <div className="container-xl max-w-[720px] mx-auto px-6">
        <h1 className="font-display font-extrabold text-4xl tracking-tight text-white mb-2">Terms of Service</h1>
        <p className="text-ink-mute text-sm mb-12">Last updated: April 2026</p>

        <div className="prose prose-invert space-y-8 text-[15px] leading-relaxed text-white/80">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance</h2>
            <p>By creating an account or using Barblink, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the app.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
            <p>You must be at least <strong>18 years old</strong> to use Barblink. Age verification is mandatory at registration. Providing false age information will result in immediate account termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Your Account</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the security of your account.</li>
              <li>One account per person. Multiple accounts may be suspended.</li>
              <li>You agree to provide accurate information and keep it updated.</li>
              <li>You must not share your account credentials with others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Acceptable Use</h2>
            <p>You agree <strong>not</strong> to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Post content that is illegal, harmful, threatening, abusive, or harassing</li>
              <li>Impersonate other users or venues</li>
              <li>Use the app to stalk, intimidate, or threaten others</li>
              <li>Post spam, advertisements, or promotional content without permission</li>
              <li>Attempt to access other users' accounts or private data</li>
              <li>Use automated tools, bots, or scrapers against the app</li>
              <li>Circumvent the age verification system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Content</h2>
            <p>You retain ownership of content you post. By posting, you grant Barblink a non-exclusive, worldwide licence to display your content within the app. You can delete your content at any time.</p>
            <p>Barblink may remove content that violates these terms or community guidelines without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Venue Information</h2>
            <p>Venue data (hours, prices, ratings) is provided for informational purposes and may not always be accurate. Barblink is not responsible for venue operations, safety, or the accuracy of scraped data. Always verify directly with venues.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Moderation & Enforcement</h2>
            <p>Barblink reserves the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Remove content that violates these terms</li>
              <li>Suspend or ban accounts for violations</li>
              <li>Report illegal activity to law enforcement</li>
              <li>Modify or discontinue features at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>Barblink is provided "as is". We are not liable for any damages arising from your use of the app, including but not limited to: incidents at venues, interactions with other users, or reliance on venue information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes</h2>
            <p>We may update these terms from time to time. Continued use of the app after changes constitutes acceptance. We will notify users of significant changes via the app or email.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>Questions about these terms:</p>
            <p className="text-neon-bright">support@barblink.com</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center text-ink-mute text-sm">
          &copy; 2026 Barblink. All rights reserved.
        </div>
      </div>
    </div>
  );
}
