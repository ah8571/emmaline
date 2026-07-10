# Privacy-First SKAN and Affiliate Tracking Plan

## Dashboard set-up

In RevenueCat,
- enable the AppsFlyer integration and enter your AppsFlyer developer key.
- If you want sandbox testing tonight, also enter the AppsFlyer sandbox developer key in RevenueCat.
- In AppsFlyer, confirm the Android app is configured correctly and that the dev key matches what the app is using.
- Decide whether you want to keep the current Android attribution level as-is. Right now the app will send the AppsFlyer ID plus RevenueCat device identifiers for better conversion matching.
- Decide whether promo codes are just for attribution first, or also for discounts. My recommendation: use your own promo code system for attribution first, then add Apple/Google discount mechanics later only if needed.

Best next step after your dashboard setup:
- make one fresh sandbox/test purchase and verify in RevenueCat that the AppsFlyer integration event delivered successfully.


## Goal

We want to measure ad performance without building user-level identity tracking.

The target setup is:

- Paid ads use Apple's SKAdNetwork (SKAN) through AppsFlyer for aggregate campaign reporting.
- Paid ads on Android use AppsFlyer or ad-platform reporting separately from SKAN.
- Subscription revenue events can be passed from RevenueCat to AppsFlyer server-to-server when needed for aggregate measurement.
- Influencer and affiliate attribution uses promo codes, not user-level referral tracking.
- The mobile app must not send our internal user IDs to AppsFlyer.

## What This Means In Practice

### Paid acquisition

For Meta, TikTok, and other paid networks, the success signal should come from SKAN and any AppsFlyer reporting built on top of SKAN.

This is useful because:

- ad networks still receive aggregate feedback about campaign performance
- AppsFlyer can report on campaign success without us creating identity-linked attribution flows
- we avoid depending on IDFA-based user tracking

On Android, this is a separate attribution path. Android installs and subscriptions do not feed SKAN. If we keep AppsFlyer on Android, we should treat it as an Android-specific attribution layer and reduce identifier collection as much as possible while still preserving usable conversion measurement.

For the current US-first rollout, we do not need to force the strictest Android reduction yet. The practical requirement is to keep disclosures accurate, avoid sending our own internal user identity to AppsFlyer, and revisit consent controls before launching in regions with stricter opt-in requirements.

### Influencer and affiliate attribution

SKAN is not the right tool for affiliate marketers.

SKAN is designed for ad network attribution and aggregate campaign measurement, not individual partner credit. For influencers, the source of truth should be promo code redemption.

Dedicated influencer landing pages can still be helpful, but only as a convenience layer:

- make the offer easy to explain
- make the code easy to remember
- reduce the chance that a user forgets to apply the code

The landing page should not be treated as the final attribution system. The promo code should be.

## Required Code Constraints

To stay aligned with this model, the client app should follow these rules:

- do not call `setCustomerUserId` in AppsFlyer
- do not send our internal Emmaline user ID or email to AppsFlyer
- do not rely on client-side purchase logging as the primary source of subscription attribution
- keep AppsFlyer limited to the minimum SDK setup needed for SKAN-oriented attribution and reporting
- if we later expand into GDPR-sensitive regions, add a separate consent path before enabling advertising-identifier-based mobile attribution where required

The current codebase has already been adjusted to remove the AppsFlyer customer user ID sync and client-side subscription event logging.

## AppsFlyer and RevenueCat Setup

### Step 1: Keep AppsFlyer focused on aggregate attribution

1. In AppsFlyer, configure the iOS app for SKAN measurement.
2. On Android, use the standard AppsFlyer attribution flow for the current US rollout unless we intentionally decide to trade attribution quality for lower identifier usage.
3. Do not configure client-side identity features that depend on our own user IDs.
4. Treat AppsFlyer as the aggregate paid-attribution layer, not a customer identity system.

### Step 2: Link RevenueCat to AppsFlyer carefully

1. In RevenueCat, enable the AppsFlyer integration.
2. Only forward the subscription lifecycle events needed for aggregate measurement and reporting.
3. Verify the exact event names that appear in AppsFlyer before configuring SKAN mappings.

### Step 3: Configure SKAN Conversion Studio

1. In AppsFlyer, open SKAN Conversion Studio.
2. Choose a simple initial mapping.
3. Map only the events we actually verify in production.

Example first-pass strategy:

- initial paid subscription or first meaningful paid conversion -> `High`
- trial start or softer paywall conversion -> `Medium`
- no meaningful downstream event yet -> `Low` or default

The exact event names should be confirmed in AppsFlyer after the RevenueCat integration is live.

## App Store Privacy Notes

This document is not a substitute for final App Store Connect privacy review.

Important rule: privacy answers must match the final SDK behavior that ships in the app, not just the intended architecture.

Before submission, re-check:

- whether the AppsFlyer SDK is still present in the client
- whether any device-level data is collected by that SDK
- whether any collected data is linked to identity inside our implementation
- whether Apple would consider the shipped setup to be tracking or only privacy-safe attribution
- whether Google Play's Data safety answers still match the actual Android configuration we ship

## Current Position

Our intended architecture is:

- SKAN for paid ad performance
- Android attribution measured separately from SKAN
- promo codes for influencer attribution
- no AppsFlyer customer user ID
- no internal user identity passed from the app to AppsFlyer

If we need more detailed affiliate measurement later, we should design that as a separate promo-code and landing-page system instead of trying to force SKAN to solve affiliate attribution.

## Advice

https://support.appsflyer.com/hc/en-us/articles/360011420698-SKAdNetwork-SKAN-solution-guide

https://support.appsflyer.com/hc/en-us/articles/4410481112081-SKAN-Conversion-Studio-overview

## Future Note: Affiliate Deep Links With Reduced Identity

We may want to revisit a privacy-reduced affiliate-link model later if influencer traffic becomes strong enough to justify more implementation complexity.

The possible future architecture would be:

- AppsFlyer handles OneLink or deferred deep linking for affiliate traffic.
- The app and backend assign the user a random internal account ID that is not based on email, phone, or other direct identity.
- RevenueCat handles subscription lifecycle events and sends renewals to our backend.
- Our backend keeps the affiliate commission ledger by linking that random internal account ID to the original affiliate source.

In theory, this could allow long-term affiliate payout tracking without sending our own internal user identity to AppsFlyer.

However, this path should be treated as an experiment, not an assumption.

Important cautions from the AppsFlyer docs:

- `anonymizeUser` removes or hashes key identifiers and can weaken normal attribution methods.
- disabling advertising identifiers before SDK start can prevent SRN attribution.
- AAP restricts user-level attribution data for iOS 14.5+ non-consenting users and changes what data is available to partners.
- deferred deep linking for paid media under AAP should use UDL rather than older GCD-based flows.

Practical implication:

- it may be possible to balance affiliate deep links with SKAN in a privacy-reduced setup
- but we should not assume that full anonymization preserves the same attribution quality
- if we test this later, we need to measure whether it weakens paid ad campaign performance or reporting enough to make it not worth the tradeoff

For now, the simpler operating assumption is:

- keep SKAN as the iPhone paid-ad path
- avoid complicating the core paid attribution setup
- use promo codes as the primary influencer and affiliate mechanism

If influencer performance later proves strong enough, we can run a contained test of:

- OneLink or affiliate deep links
- reduced-identity AppsFlyer settings
- RevenueCat plus backend recurring commission tracking

and compare the results against the simpler promo-code approach before changing the main acquisition stack.

Related docs to revisit before any such test:

- https://support.appsflyer.com/hc/en-us/articles/360001422989-Apply-privacy-preserving-SDK-methods
- https://support.appsflyer.com/hc/en-us/articles/360018515798-Apply-Aggregated-Advanced-Privacy-framework