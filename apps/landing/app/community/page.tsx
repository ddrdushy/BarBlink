export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-bg py-20">
      <div className="container-xl max-w-[720px] mx-auto px-6">
        <h1 className="font-display font-extrabold text-4xl tracking-tight text-white mb-2">Community Rules</h1>
        <p className="text-ink-mute text-sm mb-12">Last updated: April 2026</p>

        <div className="prose prose-invert space-y-8 text-[15px] leading-relaxed text-white/80">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Be Real</h2>
            <p>Barblink is about authentic nightlife experiences. Don't fake check-ins, post misleading content, or impersonate venues or DJs.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Be Respectful</h2>
            <p>Treat other users the way you'd want to be treated at the bar. No harassment, hate speech, discrimination, or threatening behaviour. This includes DMs, comments, and check-in reactions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Keep It Safe</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Don't share someone's location without their consent</li>
              <li>Don't post photos of others without their permission</li>
              <li>Use the "I'm Home Safe" feature — your trusted circle cares about you</li>
              <li>Report concerning behaviour to help keep the community safe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">No Underage Users</h2>
            <p>Barblink is strictly 18+. If you suspect an underage user, report them immediately. We take this seriously — underage accounts are permanently banned.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">No Spam or Promotion</h2>
            <p>Don't use Barblink for unsolicited advertising, spam, or commercial promotion. Venues and DJs have dedicated profiles — don't create user accounts for promotional purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Content Standards</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>No explicit or NSFW content</li>
              <li>No illegal activity promotion</li>
              <li>No substance abuse glorification</li>
              <li>No violence or graphic content</li>
              <li>Posts should relate to nightlife, social outings, and venue experiences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Enforcement</h2>
            <p>Violations result in: content removal, temporary suspension, or permanent ban depending on severity. Repeated minor violations escalate. Appeals can be sent to support@barblink.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Report</h2>
            <p>See something wrong? Use the in-app report button on any post, comment, or profile. Reports are reviewed within 24 hours.</p>
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
