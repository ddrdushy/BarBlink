export default function TerminalHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon flex items-center justify-center text-xl font-bold">
            B
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Club Terminal
          </h1>
        </div>

        {/* QR Scanner Placeholder */}
        <div className="bg-surface border border-neon-border rounded-2xl p-12">
          <div className="w-48 h-48 mx-auto border-2 border-dashed border-ink-faint rounded-xl flex items-center justify-center mb-6">
            <svg
              className="w-16 h-16 text-ink-faint"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-ink">
            Scan QR to verify check-in
          </p>
          <p className="text-sm text-ink-mute mt-2">
            This app runs on a tablet at the venue entrance
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-elevated rounded-xl p-6 border border-white/5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-ghost text-neon text-sm font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            Coming Soon
          </div>
          <p className="text-ink-mute text-sm">
            The Club Terminal will allow venues to verify check-ins, manage guest
            lists, and track real-time crowd levels from a dedicated tablet interface.
          </p>
        </div>

        <p className="text-ink-faint text-xs">
          Barblink Club Terminal v0.1.0
        </p>
      </div>
    </div>
  );
}
