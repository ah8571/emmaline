# App Store Publishing

This document covers the practical steps to publish Emmaline to the Apple App Store and Google Play.

## Quick Answer On D-U-N-S

- Apple requires a D-U-N-S number only if you enroll in the Apple Developer Program as an organization.
- Apple does not require a D-U-N-S number if you enroll as an individual.
- Google Play does not require a D-U-N-S number for normal app publishing.
- A "Brad number" usually means the Dun & Bradstreet D-U-N-S number.

## Business Accounts You Will Need

### Apple

- Apple Developer Program account
- Cost: $99/year
- Decide whether you are enrolling as an individual or an organization
- If organization: legal entity, authority to sign, and D-U-N-S number

### Google

- Google Play Console developer account
- One-time registration fee
- Google payments profile if you will sell subscriptions or paid features

## Required Business And Legal Prep

- Final app name
- Privacy Policy URL
- Terms of Use URL
- Support email address
- Support website or landing page
- Company or developer display name
- Clear explanation of microphone, transcript, note, and account data usage
- Account deletion flow inside the app if users can create accounts

## Emmaline-Specific Compliance Items

Because Emmaline records calls, creates transcripts, stores notes, and uses AI services, expect the stores to review these items carefully:

- Microphone permission purpose text must be very clear
- Privacy Policy must explain audio, transcript, note, and AI processing flows
- Account-based apps should support account deletion
- Apple privacy nutrition labels must match actual data collection and sharing
- Google Play Data safety answers must match the app and backend behavior exactly
- If you later add subscriptions, both stores will require subscription metadata and restore/account management flows

## Technical Release Prep

- Confirm production bundle identifiers / package names are final
- Confirm app icons, splash screens, and store listing graphics are final
- Confirm versioning strategy
- Confirm production API environment variables
- Confirm release builds work outside development mode
- Remove development-only logging where necessary
- Validate auth, calling, notes, transcript viewing, and logout in release builds
- Verify deep links and any universal/app links if used

## Expo / EAS Release Setup

Emmaline is already using Expo and a custom dev client, so the clean path to store releases is EAS Build + EAS Submit.

### Recommended Setup

- Finalize `app.json` or `app.config.*`
- Set stable iOS bundle identifier
- Set stable Android package name
- Configure EAS build profiles for `preview` and `production`
- Store signing credentials securely

### iOS

- Apple distribution certificate
- App Store provisioning profile
- App Store Connect app record

### Android

- Android keystore
- Play Console app record
- AAB generation for Play Store upload

## Apple App Store Submission Steps

1. Enroll in Apple Developer Program.
2. If publishing as a company, obtain a D-U-N-S number and complete organization enrollment.
3. Create the app in App Store Connect.
4. Set bundle ID and signing configuration.
5. Build a production iOS archive with EAS Build.
6. Upload the build to App Store Connect.
7. Complete store metadata:
   - app name
   - subtitle
   - description
   - keywords
   - support URL
   - marketing URL if available
   - privacy policy URL
   - screenshots for required device sizes
8. Complete App Privacy nutrition labels.
9. Answer export compliance questions.
10. Provide review notes and demo/test credentials.
11. Submit for review.

## Google Play Submission Steps

1. Create Google Play Console account.
2. Create the app record in Play Console.
3. Set package name and signing.
4. Build a production Android AAB with EAS Build.
5. Upload the AAB to an internal testing track first.
6. Complete store metadata:
   - app name
   - short description
   - full description
   - screenshots
   - feature graphic
   - privacy policy URL
   - contact details
7. Complete Data safety form.
8. Complete content rating questionnaire.
9. Declare permissions and any sensitive behaviors.
10. Create a production release after internal testing passes.

## App Assets You Will Need

- App icon
- Splash screen
- iPhone screenshots
- Android phone screenshots
- Optional tablet screenshots if supported
- Feature graphic for Google Play
- Short and long descriptions
- Privacy Policy page
- Support page or contact page

## App Review Risk Areas For Emmaline

- Ambiguous microphone usage
- Missing explanation of transcript storage
- Missing explanation of AI processing by third parties
- No account deletion flow for authenticated users
- Mismatch between privacy answers and actual backend behavior
- Demo credentials not provided to reviewers
- Unclear value proposition in store copy

## Recommended Pre-Launch Sequence

1. Finalize legal pages.
2. Finalize production environment variables and backend URLs.
3. Confirm release icons, splash, and screenshots.
4. Add account deletion flow if it is not already implemented.
5. Test a production-like build on physical iPhone and Android devices.
6. Ship to TestFlight and Play internal testing.
7. Fix review feedback from testers.
8. Submit to both stores.

## Minimum Checklist Before Submission

- Production build succeeds on iOS
- Production build succeeds on Android
- Login works
- Logout works
- Call flow works
- Transcript list and details work
- Notes load and save correctly
- Privacy Policy URL is live
- Terms URL is live
- Support contact is live
- Store screenshots are ready
- Apple privacy answers are complete
- Google Data safety form is complete

## Likely Next Emmaline Tasks Before Publishing

- Add account deletion flow in-app and backend
- Confirm privacy disclosures for Twilio, OpenAI, Supabase, and any speech services
- Create release-ready store screenshots
- Create production EAS profiles and signing setup
- Validate release builds instead of dev client builds

## Suggested Follow-Up Docs

- release checklist
- production environment setup
- app privacy disclosures
- reviewer test account instructions