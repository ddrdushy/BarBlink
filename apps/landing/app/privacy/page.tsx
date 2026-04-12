export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg py-20">
      <div className="container-xl max-w-[720px] mx-auto px-6">
        <h1 className="font-display font-extrabold text-4xl tracking-tight text-white mb-2">Privacy Policy</h1>
        <p className="text-ink-mute text-sm mb-12">Last updated: April 2026</p>

        <div className="prose prose-invert space-y-8 text-[15px] leading-relaxed text-white/80">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p><strong>Account Data:</strong> Phone number, email address, date of birth (for 18+ verification), username, display name, and country.</p>
            <p><strong>Usage Data:</strong> Check-ins, posts, likes, comments, venue visits, and app interactions.</p>
            <p><strong>Device Data:</strong> Device type, operating system, app version. We do not collect device identifiers for advertising.</p>
            <p><strong>Location Data:</strong> GPS coordinates are collected only during check-ins and only when you explicitly tap "Check in". We do not track your location in the background.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To authenticate your account and verify your age (18+)</li>
              <li>To display your profile to other users</li>
              <li>To show you nearby venues and personalise your feed</li>
              <li>To power the crowd meter and "Who's Out Tonight" features</li>
              <li>To send you OTP codes and account notifications</li>
              <li>To improve the app through aggregated, anonymous analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Sharing</h2>
            <p>We do <strong>not</strong> sell your personal data to third parties. We share data only in these cases:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>With other users:</strong> Your username, display name, check-ins, and posts are visible to other Barblink users.</li>
              <li><strong>Service providers:</strong> Email delivery (Mailgun), hosting infrastructure. These providers process data on our behalf under strict agreements.</li>
              <li><strong>Legal requirements:</strong> If required by law or to protect safety.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored on encrypted servers. Passwords are never stored — we use OTP-based authentication. JWT tokens are stored securely on your device. We use HTTPS for all data transmission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Access:</strong> Request a copy of your data at any time.</li>
              <li><strong>Correction:</strong> Update your profile information in the app.</li>
              <li><strong>Deletion:</strong> Request complete account and data deletion by emailing support@barblink.com.</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Cookies</h2>
            <p>Our website (barblink.com) uses essential cookies for functionality and analytics cookies to understand traffic. You can disable analytics cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Age Restriction</h2>
            <p>Barblink is strictly for users aged 18 and above. We verify age at registration and do not knowingly collect data from anyone under 18. If we discover an underage account, it will be immediately deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Contact</h2>
            <p>For privacy questions or data requests:</p>
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
