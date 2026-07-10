# Promo Code System Plan

This document outlines the recommended promo code architecture for Emmaline across iOS and Android.

## Goal

We want one promo code system that can do two jobs:

- attribute new subscribers to creators, affiliates, or campaigns
- optionally unlock a discount without breaking App Store or Google Play billing rules

The key design rule is simple:

- Emmaline owns promo code validation and attribution
- Apple and Google own the actual subscription billing and discount mechanics

## Recommended Model

Use promo codes in two phases.

### Phase 1: Attribution first

Start with first-party promo codes that are validated by our backend.

Flow:

1. User taps a `Have a promo code?` action in the app.
2. User enters a code such as `EMMA-SARA`.
3. Backend validates the code and returns:
   - valid or invalid
   - campaign or creator metadata
   - whether the code also unlocks a discount
4. App stores the validated code against the signed-in user in our backend.
5. If the user later subscribes, our backend remains the source of truth for attribution.

This gives us a cross-platform attribution system without depending on Apple or Google promo tooling.

### Phase 2: Discount-enabled codes

Once attribution is stable, allow certain promo codes to unlock a discounted subscription path.

Flow:

1. User enters a valid code.
2. Backend returns a discount type, such as:
   - 10% off monthly
   - first month discounted
   - extended trial
3. App reveals the matching store-supported offer.
4. Purchase still completes through Apple or Google billing.

Important point: the promo code does not directly modify store pricing by itself. It only determines which store-supported offer the app should present.

## Platform Reality

There is no single universal subscription coupon API that works the same way on both platforms.

### iOS

Discounts must be represented using App Store subscription pricing tools, such as promotional offers, introductory offers, or offer codes depending on the exact use case.

Practical implication:

- the app cannot invent a custom discounted subscription price at runtime
- the discounted option has to exist in Apple's subscription configuration

### Android

Discounts must be represented using Google Play subscription base plans and offers.

Practical implication:

- the app cannot directly override the subscription price at checkout
- the discounted path must already exist in Google Play and be exposed through RevenueCat

### Cross-platform conclusion

Promo code validation should be our own system.

Discount fulfillment should be a mapping layer:

- promo code -> internal offer type
- internal offer type -> Apple offer configuration
- internal offer type -> Google Play offer configuration

## RevenueCat Fit

RevenueCat is a good fit for the paywall and entitlement side, but it is not the source of truth for promo-code business logic.

Recommended split:

- backend validates promo codes and stores attribution
- RevenueCat serves the correct package or offer that matches the allowed store configuration
- backend records which promo code was used when the subscription starts

This keeps attribution logic portable even if store offer mechanics change later.

## Suggested UX

On the Upgrade screen, add a lightweight promo-code flow.

Recommended UI:

1. Default paywall shows the normal monthly plan.
2. A secondary action says `Have a promo code?`
3. User enters code.
4. If invalid, show a clear error.
5. If valid with attribution only, show confirmation that the code has been applied to the account.
6. If valid with discount, update the paywall copy and purchase button to reflect the special offer.

This is likely better than forcing promo code entry during sign-up because it keeps the purchase intent and the discount flow in the same place.

## Pricing Strategy

Current monthly price is about $9.99.

If we want to offer a creator or promo discount without giving up too much margin, raising the public list price is reasonable.

### Simple pricing options

Option A:

- raise list price to $10.99
- promo code gives about 10% off
- discounted price lands near the current public price

Option B:

- raise list price to $11.99
- promo code gives 10% to 15% off
- standard buyers pay more, promo buyers still feel like they got a real benefit

Option C:

- keep list price at $9.99
- use promo codes for attribution only at first
- add discounts later once conversion rates justify the margin tradeoff

My recommendation:

- if discounts are important for creator growth, move the standard monthly price slightly higher first
- keep the discount modest, around 10%
- avoid large recurring discounts until we have real retention data

## Is It Easy To Change Subscription Price?

Yes, operationally it is possible on both platforms, but it is not completely frictionless.

### Apple

You can change subscription pricing in App Store Connect.

Things to watch:

- Apple may notify existing subscribers about price changes
- some price increases can create user friction depending on region and subscription state
- grandfathering existing subscribers may be cleaner than forcing a change immediately

### Google Play

You can also change subscription pricing in Play Console.

Things to watch:

- price changes for existing subscribers need to be reviewed carefully
- it is often cleaner to think separately about new-customer pricing versus legacy-subscriber pricing

### Practical recommendation

If we raise price, do it deliberately and treat existing subscribers carefully.

The lowest-risk business approach is usually:

- keep current subscribers on existing economics where possible
- raise the public price for new subscribers
- use promo codes to bring selected users back toward the old effective price

## Recommended First Implementation

Build this in order:

1. Backend promo code table and validation endpoint.
2. Upgrade screen promo code entry UI.
3. User-level storage of the applied promo code in our backend.
4. Attribution reporting tied to subscription activation.
5. Store-configured discounted offers in Apple and Google.
6. RevenueCat mapping so the paywall can present the right package after a valid code.

## What We Should Not Do

- do not treat Apple offer codes and Google offers as the main attribution ledger
- do not rely on RevenueCat alone to decide affiliate credit
- do not hardcode discount math in the app without corresponding store-configured offers
- do not assume one promo implementation will behave identically across iOS and Android

## Near-Term Recommendation

For the next step, design promo codes as an Emmaline-owned attribution layer first.

Then decide whether the first version should:

- store codes only for attribution
- or store codes and unlock a modest store-backed discount, ideally around 10%

If we want discounted promo codes soon, it is reasonable to consider a small list-price increase before rollout so promo users can feel a real benefit without compressing revenue too aggressively.