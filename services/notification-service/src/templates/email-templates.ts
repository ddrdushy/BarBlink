// Barblink — HTML email templates for vendor and DJ notifications.
//
// All templates use dark-theme inline CSS matching the Barblink brand:
//   Background: #0D0D0F   Card: #1A1A1F   Accent: #C45AFF
//
// Each function returns { subject, html } ready for Mailgun transport.

const BASE_STYLE = `
  body { margin:0; padding:0; background:#0D0D0F; font-family:'Helvetica Neue',Arial,sans-serif; -webkit-text-size-adjust:100%; }
  .container { max-width:520px; margin:0 auto; padding:40px 20px; }
  .card { background:#1A1A1F; border-radius:12px; padding:40px 32px; }
  .logo { color:#C45AFF; font-size:28px; font-weight:800; text-align:center; margin:0 0 4px; letter-spacing:-0.5px; }
  .tagline { color:#666; font-size:12px; text-align:center; margin:0 0 32px; }
  h2 { color:#FFFFFF; font-size:22px; font-weight:700; margin:0 0 16px; line-height:1.3; }
  p { color:#AAAAAA; font-size:14px; line-height:1.7; margin:0 0 14px; }
  .highlight { color:#C45AFF; font-weight:600; }
  .detail-row { color:#888; font-size:13px; margin:0 0 8px; }
  .detail-label { color:#666; }
  .button-wrap { text-align:center; margin:28px 0 8px; }
  .button { display:inline-block; background:#C45AFF; color:#FFFFFF; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; }
  .divider { border:none; border-top:1px solid #2A2A2F; margin:24px 0; }
  .footer { color:#555; font-size:11px; text-align:center; margin:28px 0 0; line-height:1.5; }
  .footer a { color:#C45AFF; text-decoration:none; }
  .reason-box { background:#111114; border-left:3px solid #C45AFF; padding:12px 16px; border-radius:0 8px 8px 0; margin:16px 0; }
  .reason-box p { color:#ccc; margin:0; font-size:13px; }
`;

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Barblink</title>
  <style>${BASE_STYLE}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">barblink</div>
      <div class="tagline">Blink, You're In.</div>
      ${body}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Barblink Sdn Bhd. All rights reserved.<br>
      <a href="https://barblink.com">barblink.com</a> &middot;
      <a href="mailto:hello@barblink.com">hello@barblink.com</a>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. vendor-applied — sent to vendor on registration
// ---------------------------------------------------------------------------
export function vendorApplied(businessName: string): { subject: string; html: string } {
  return {
    subject: 'We received your Barblink venue application',
    html: wrap(`
      <h2>Application received</h2>
      <p>Hi there,</p>
      <p>
        We've received your venue application for
        <span class="highlight">${businessName}</span>.
        Our team will review it and get back to you within
        <strong style="color:#fff;">24 hours</strong>.
      </p>
      <hr class="divider">
      <p>While you wait, make sure your venue's Instagram profile is public so we can verify your business.</p>
      <p>Questions? Reach us at <a href="mailto:hello@barblink.com" style="color:#C45AFF;text-decoration:none;">hello@barblink.com</a>.</p>
    `),
  };
}

// ---------------------------------------------------------------------------
// 2. vendor-applied-admin — sent to admin when vendor registers
// ---------------------------------------------------------------------------
export function vendorAppliedAdmin(
  businessName: string,
  contactName: string,
  email: string,
  businessType: string,
): { subject: string; html: string } {
  return {
    subject: `New venue application: ${businessName}`,
    html: wrap(`
      <h2>New vendor application</h2>
      <p>A new venue has applied to join Barblink.</p>
      <hr class="divider">
      <p class="detail-row"><span class="detail-label">Business:</span> <span class="highlight">${businessName}</span></p>
      <p class="detail-row"><span class="detail-label">Contact:</span> <strong style="color:#fff;">${contactName}</strong></p>
      <p class="detail-row"><span class="detail-label">Email:</span> <strong style="color:#fff;">${email}</strong></p>
      <p class="detail-row"><span class="detail-label">Type:</span> <strong style="color:#fff;">${businessType}</strong></p>
      <hr class="divider">
      <div class="button-wrap">
        <a href="https://admin.barblink.com/vendor-applications" class="button">Review Application</a>
      </div>
    `),
  };
}

// ---------------------------------------------------------------------------
// 3. vendor-approved — sent to vendor when admin approves
// ---------------------------------------------------------------------------
export function vendorApproved(businessName: string): { subject: string; html: string } {
  return {
    subject: 'Your Barblink vendor account is approved',
    html: wrap(`
      <h2>You're approved!</h2>
      <p>Great news! Your venue application for <span class="highlight">${businessName}</span> has been approved.</p>
      <p>
        You can now log in to your vendor dashboard to manage your venue profile,
        view check-in analytics, and respond to reviews.
      </p>
      <div class="button-wrap">
        <a href="https://venue.barblink.com/login" class="button">Log In to Dashboard</a>
      </div>
      <hr class="divider">
      <p>Need help getting started? Email us at <a href="mailto:hello@barblink.com" style="color:#C45AFF;text-decoration:none;">hello@barblink.com</a>.</p>
    `),
  };
}

// ---------------------------------------------------------------------------
// 4. vendor-rejected — sent to vendor when admin rejects
// ---------------------------------------------------------------------------
export function vendorRejected(businessName: string, reason: string): { subject: string; html: string } {
  return {
    subject: 'Update on your Barblink application',
    html: wrap(`
      <h2>Application update</h2>
      <p>Hi there,</p>
      <p>
        Thank you for your interest in listing
        <span class="highlight">${businessName}</span> on Barblink.
        After reviewing your application, we're unable to approve it at this time.
      </p>
      <div class="reason-box">
        <p><strong style="color:#C45AFF;">Reason:</strong> ${reason}</p>
      </div>
      <p>
        If you believe this was a mistake or would like to provide additional information,
        please reply to this email or contact us at
        <a href="mailto:hello@barblink.com" style="color:#C45AFF;text-decoration:none;">hello@barblink.com</a>.
      </p>
    `),
  };
}

// ---------------------------------------------------------------------------
// 5. vendor-password-reset — sent to vendor on forgot password
// ---------------------------------------------------------------------------
export function vendorPasswordReset(resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Reset your Barblink vendor password',
    html: wrap(`
      <h2>Password reset</h2>
      <p>We received a request to reset your vendor portal password.</p>
      <p>Click the button below to choose a new password. This link expires in <strong style="color:#fff;">1 hour</strong>.</p>
      <div class="button-wrap">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <hr class="divider">
      <p style="font-size:12px;color:#666;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    `),
  };
}

// ---------------------------------------------------------------------------
// 6. dj-applied — sent to DJ on registration
// ---------------------------------------------------------------------------
export function djApplied(stageName: string): { subject: string; html: string } {
  return {
    subject: 'We received your Barblink DJ application',
    html: wrap(`
      <h2>Application received</h2>
      <p>Hey <span class="highlight">${stageName}</span>,</p>
      <p>
        We've received your DJ application. Our team will review it and
        get back to you within <strong style="color:#fff;">24 hours</strong>.
      </p>
      <hr class="divider">
      <p>
        Once approved, you'll get access to your DJ dashboard where you can
        manage your profile, post upcoming gigs, and track your ratings.
      </p>
      <p>Questions? Hit us up at <a href="mailto:hello@barblink.com" style="color:#C45AFF;text-decoration:none;">hello@barblink.com</a>.</p>
    `),
  };
}

// ---------------------------------------------------------------------------
// 7. dj-applied-admin — sent to admin when DJ registers
// ---------------------------------------------------------------------------
export function djAppliedAdmin(
  stageName: string,
  claimType: 'new' | 'claim',
  email: string,
  djType: string,
): { subject: string; html: string } {
  const claimLabel = claimType === 'claim' ? 'Profile Claim' : 'New Profile';
  return {
    subject: `New DJ application: ${stageName}`,
    html: wrap(`
      <h2>New DJ application</h2>
      <p>A DJ/band has applied to join Barblink.</p>
      <hr class="divider">
      <p class="detail-row"><span class="detail-label">Stage name:</span> <span class="highlight">${stageName}</span></p>
      <p class="detail-row"><span class="detail-label">Type:</span> <strong style="color:#fff;">${djType}</strong></p>
      <p class="detail-row"><span class="detail-label">Application:</span> <strong style="color:#fff;">${claimLabel}</strong></p>
      <p class="detail-row"><span class="detail-label">Email:</span> <strong style="color:#fff;">${email}</strong></p>
      <hr class="divider">
      <div class="button-wrap">
        <a href="https://admin.barblink.com/dj-applications" class="button">Review Application</a>
      </div>
    `),
  };
}

// ---------------------------------------------------------------------------
// 8. dj-approved — sent to DJ when admin approves
// ---------------------------------------------------------------------------
export function djApproved(stageName: string): { subject: string; html: string } {
  return {
    subject: 'Your Barblink DJ profile is live',
    html: wrap(`
      <h2>You're in!</h2>
      <p>
        Congrats <span class="highlight">${stageName}</span> — your DJ profile
        is now live on Barblink.
      </p>
      <p>
        Log in to your dashboard to update your profile, add upcoming gigs,
        manage your setlists, and connect with venues across KL.
      </p>
      <div class="button-wrap">
        <a href="https://dj.barblink.com/login" class="button">Log In to Dashboard</a>
      </div>
      <hr class="divider">
      <p>Need help? Reach us at <a href="mailto:hello@barblink.com" style="color:#C45AFF;text-decoration:none;">hello@barblink.com</a>.</p>
    `),
  };
}

// ---------------------------------------------------------------------------
// 9. dj-rejected — sent to DJ when admin rejects
// ---------------------------------------------------------------------------
export function djRejected(stageName: string, reason: string): { subject: string; html: string } {
  return {
    subject: 'Update on your Barblink DJ application',
    html: wrap(`
      <h2>Application update</h2>
      <p>Hey <span class="highlight">${stageName}</span>,</p>
      <p>
        Thanks for applying to join Barblink as a DJ.
        After reviewing your application, we're unable to approve it at this time.
      </p>
      <div class="reason-box">
        <p><strong style="color:#C45AFF;">Reason:</strong> ${reason}</p>
      </div>
      <p>
        If you'd like to provide more info or think this was a mistake,
        please reply to this email or contact
        <a href="mailto:hello@barblink.com" style="color:#C45AFF;text-decoration:none;">hello@barblink.com</a>.
      </p>
    `),
  };
}

// ---------------------------------------------------------------------------
// 10. dj-password-reset — sent to DJ on forgot password
// ---------------------------------------------------------------------------
export function djPasswordReset(resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Reset your Barblink DJ portal password',
    html: wrap(`
      <h2>Password reset</h2>
      <p>We received a request to reset your DJ portal password.</p>
      <p>Click the button below to choose a new password. This link expires in <strong style="color:#fff;">1 hour</strong>.</p>
      <div class="button-wrap">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <hr class="divider">
      <p style="font-size:12px;color:#666;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    `),
  };
}
