export default function WebHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon flex items-center justify-center text-2xl font-bold">
            B
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Barblink</h1>
        </div>

        {/* Coming Soon */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-ghost text-neon text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            Coming Soon
          </div>
          <h2 className="text-2xl font-semibold">
            Barblink Web is coming soon
          </h2>
          <p className="text-ink-mute">
            The full Barblink experience on your browser. Until then, grab the
            mobile app to discover KL nightlife.
          </p>
        </div>

        {/* App Store Links */}
        <div className="bg-surface border border-neon-border rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-ink-mute uppercase tracking-wider">
            Download the mobile app
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://apps.apple.com/app/barblink"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.barblink"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.808 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              Google Play
            </a>
          </div>
        </div>

        {/* Link to website */}
        <a
          href="https://barblink.com"
          className="text-neon hover:text-neon-bright transition-colors text-sm font-medium"
        >
          Visit barblink.com
        </a>

        <p className="text-ink-faint text-xs">
          Barblink Web v0.1.0
        </p>
      </div>
    </div>
  );
}
