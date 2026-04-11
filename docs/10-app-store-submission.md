# 10 — App Store Submission

## Overview

Both iOS (Apple App Store) and Android (Google Play Store) submissions are required. The app is free to download with no in-app purchases at launch.

---

## Accounts to Create

| Platform | Account | Cost | Who Creates |
|---|---|---|---|
| Apple App Store | Apple Developer Program | $99/year | Founder |
| Google Play Store | Google Play Developer | $25 one-time | Founder |

Both accounts must be created by the founder/company — cannot be done by Claude or any automated process.

---

## App Details

| Field | Value |
|---|---|
| App Name | Barblink |
| Subtitle (iOS) | KL's Nightlife Social App |
| Bundle ID (iOS) | com.barblink.app |
| Package Name (Android) | com.barblink.app |
| Version (first release) | 1.0.0 |
| Primary Language | English |
| Primary Category | Social Networking |
| Secondary Category | Entertainment |
| Price | Free |
| In-App Purchases | None at launch |

---

## Age Rating

### iOS (Apple)
- Age Rating: **17+**
- Reasons: Frequent/Intense Alcohol, Tobacco, or Drug Use or References
- Set during App Store Connect submission

### Android (Google Play)
- Content Rating: **Mature 17+**
- Set via the content rating questionnaire in Play Console
- Select: Alcohol references

---

## Required Assets

### App Icon
- iOS: 1024×1024px PNG (no alpha, no rounded corners — Apple applies rounding)
- Android: 512×512px PNG
- Design: Barblink owl mascot on #0D0D0F background with neon purple accent

### Screenshots (required per device size)

**iOS — required sizes:**
- iPhone 6.9" (1320×2868px) — minimum 3, recommended 10
- iPhone 6.5" (1242×2688px)
- iPad Pro 13" (2064×2752px) — if supporting iPad

**Android — required sizes:**
- Phone screenshots (minimum 2): 1080×1920px recommended
- 7-inch tablet (optional)
- 10-inch tablet (optional)

**Recommended screenshots (in order):**
1. Blink Feed — home feed with hero post + check-in cards
2. Venue discovery map — with crowd indicators
3. DJ profile page — upcoming gigs
4. What's On Tonight — events feed
5. Check-in screen — success animation
6. User profile — nightlife passport map

### App Preview Video (optional but recommended)
- iOS: 15–30 seconds, portrait orientation, no audio required
- Android: YouTube link or uploaded MP4
- Show: feed scrolling, check-in flow, DJ discovery, map view

---

## Store Listing Copy

### App Name
Barblink

### Subtitle (iOS only, 30 chars max)
KL's Nightlife Social App

### Description (iOS + Android, up to 4,000 chars)

```
Blink, You're In.

Barblink is the social app made for KL's nightlife scene. Whether 
you're bar-hopping in Bukit Bintang, catching a DJ set in KLCC, or 
planning a night out with your crew — Barblink keeps you connected.

DISCOVER WHAT'S HAPPENING TONIGHT
• Browse bars and clubs near you on a live map
• See real-time crowd levels — know before you go
• Check out tonight's DJ lineup and upcoming events

FOLLOW YOUR FAVOURITE DJs
• Search DJ and live band profiles
• Get notified when they're performing nearby
• See who's hot this week across KL

SOCIAL MADE FOR NIGHTLIFE
• Share your night — photos, stories, drink ratings
• See where your friends are checked in right now
• React to your crew's check-ins with quick emojis
• "Who's Out Tonight" — your friends, live

PLAN YOUR NIGHT
• Set your "Going Tonight" status and rally your crew
• RSVP to events and see who else is going
• Create group check-ins for your squad
• Trusted circle — share your location with people you trust

YOUR NIGHTLIFE STORY
• Build your Nightlife Passport — every bar you've visited on a map
• Earn streaks for consecutive nights out
• Become a Verified Regular at your favourite spots
• Weekly leaderboards — who's the most active in your area?

Available in Kuala Lumpur. 18+ only. Valid for non-Muslim users.
```

### Keywords (iOS, 100 chars max)
```
nightlife,bars,clubs,KL,Kuala Lumpur,DJ,check-in,social,events,drinks
```

### What's New (first version)
```
Welcome to Barblink — Blink, You're In.

This is our first release. Discover bars and clubs in KL, follow your 
favourite DJs, and share your nights with your crew.
```

---

## Privacy Policy (Required by Both Stores)

Must be live at: **https://barblink.com/privacy**

Must cover:
- What data is collected (name, phone, DOB, location, photos)
- How data is used
- Age restriction (18+, Malaysia)
- Data sharing (no selling to third parties)
- User rights (delete account, data export)
- Contact: privacy@barblink.com

---

## Terms of Service (Required)

Must be live at: **https://barblink.com/terms**

Must cover:
- 18+ age requirement
- Malaysia jurisdiction
- Prohibited content
- Account termination policy
- Alcohol-related content disclaimer

---

## Technical Requirements

### iOS
- Minimum iOS version: 16.0
- Devices: iPhone (primary), iPad (optional)
- Built with: Expo + EAS Build (generates .ipa file)
- Submitted via: Transporter app or EAS Submit

### Android
- Minimum Android version: Android 10 (API 29)
- Built with: Expo + EAS Build (generates .aab file — Android App Bundle)
- Submitted via: Google Play Console

### EAS Build Commands
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

---

## Submission Checklist

### Before Submitting
- [ ] Apple Developer Account created and active
- [ ] Google Play Developer Account created
- [ ] App icon created (1024×1024 iOS, 512×512 Android)
- [ ] All screenshots created for required device sizes
- [ ] Privacy policy live at barblink.com/privacy
- [ ] Terms of service live at barblink.com/terms
- [ ] Age gate tested — under 18 is blocked
- [ ] Production API URL set in app config
- [ ] App version set to 1.0.0
- [ ] EAS Build configured (eas.json)
- [ ] iOS: Provisioning profile + certificates set up in Apple Developer portal
- [ ] Android: Keystore generated and stored securely

### iOS Submission
- [ ] EAS Build — iOS production build generated (.ipa)
- [ ] App Store Connect — new app created
- [ ] App Store Connect — metadata filled (name, subtitle, description, keywords)
- [ ] App Store Connect — screenshots uploaded per device size
- [ ] App Store Connect — age rating set to 17+
- [ ] App Store Connect — privacy policy URL entered
- [ ] Build submitted for review
- [ ] Apple review typically takes 24–48 hours

### Android Submission
- [ ] EAS Build — Android production build generated (.aab)
- [ ] Play Console — new app created
- [ ] Play Console — store listing filled (title, description, screenshots)
- [ ] Play Console — content rating questionnaire completed (Mature 17+)
- [ ] Play Console — privacy policy URL entered
- [ ] Play Console — app pricing set to Free
- [ ] Build uploaded and submitted for review
- [ ] Google review typically takes 1–3 days

---

## Post-Launch

- Monitor crash reports via Expo / Sentry
- Respond to user reviews within 48 hours
- Update app version for bug fixes using EAS Update (OTA updates for JS changes)
- Major native changes require a new store submission
