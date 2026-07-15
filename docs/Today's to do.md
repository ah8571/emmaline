## apple fixes

Guideline 3.1.1 — Free trial too short: 

In App Store Connect → your app → Subscriptions → emmaline_pro_monthly → Subscription Prices → either remove the introductory offer entirely, or set the free trial to at least 3 days. Apple requires minimum 3-day trials for auto-renewable subscriptions.

App Store metadata: In App Store Connect → App Information, make sure the Privacy Policy URL field is filled in (https://www.emmaline.app/privacy). For Terms of Use, either link to your EULA in the App Description or upload a custom EULA in App Store Connect.

## Google subscription fixes

Thing to check in Google Play Console	Where
Your Gmail is a licensed tester	Setup → License testing → add email
Your Gmail is on the closed track	Testing → Closed testing → Testers tab
You've accepted the invite	Check your email for the opt-in link
Product emmaline_pro_monthly is active	Monetize → Products → Subscriptions → status
The "item not found" error is Google Play Billing saying "this user isn't authorized to see this product" — which is the licensed tester gate, not a build issue.



## AppsFlyer:
dev key
iOS app ID confirmation
the SKAdNetwork ID list from AppsFlyer or your ad partners
confirmation that RevenueCat -> AppsFlyer integration is enabled
your first-pass Conversion Studio mapping choice, probably:
subscription = high
trial/paywall conversion = medium

Mapping (suggested): Fine values — 1 = Registration, 2 = FreeTrial (placeholder), 3 = Subscription. Coarse: Low = Session, High = Subscribe. Configure this in AppsFlyer Conversion Studio.

What I changed: registration is logged in api.js; subscribe is logged in revenueCatService.js. Guidance added to .env.example and app.config.js reads EXPO_PUBLIC_IOS_SKADNETWORK_IDS.

SKAN IDs: get canonical IDs from each ad network dashboard or AppsFlyer Settings → SKAdNetwork. For TikTok/Meta use their partner docs (they publish SKAN IDs) or copy the list AppsFlyer shows for those partners.

Next: if you paste TikTok (and optionally Meta) SKAN IDs I will create an EAS secret EXPO_PUBLIC_IOS_SKADNETWORK_IDS and trigger a production TestFlight build for validation.

Note: installs are measured by SKAN postbacks; in-app appsFlyer.logEvent(...) provides the events Conversion Studio maps to conversion values for ROAS later.

## Provider keys:
Gemini live: https://ai.google.dev/gemini-api/docs/live-api

## Affiliate draft inputs:
1 creator slug/name to use as the first real landing page
rough promo code format you want, even if temporary
optional headline/testimonial copy for that creator page

## Testing readiness

one fresh iPhone test build after the AppsFlyer/SKAN values are in

##

Remodeling the subscription method to go to web for payments (ie to get payment for the app asap) along with incorporating privacy oriented skan conventions. 

## Weekly allotments 

Google Play Console → Monetize → Subscriptions → create emmaline_pro_weekly_30min and emmaline_pro_weekly_60min

RevenueCat → Products → the new products should auto-import within a few minutes after step 1

RevenueCat → Offerings → add the two weekly products as packages in your existing offering (alongside the monthly one)

RevenueCat → Entitlements → attach both to the pro entitlement (same as the monthly product)

Then the webhook I added at /api/billing/revenuecat-webhook will detect purchases of those product IDs and grant the corresponding seconds automatically.

Same flow for App Store Connect when you get to iOS, just with different product IDs if you want platform-specific pricing.

Free trial reduced from 300s (5 min) → 120s (2 min) in billingService.js
Migration created to update the database default
Weekly tier config defined: emmaline_pro_weekly_30min → 1800s, emmaline_pro_weekly_60min → 3600s
What you need to do in RevenueCat:

Create two new products: emmaline_pro_weekly_30min ($10) and emmaline_pro_weekly_60min ($15)
Create corresponding Google Play subscription products
Attach them to the pro entitlement
Add them to your offering alongside the monthly product
What I still need to add:
A RevenueCat webhook that grants prepaid_seconds_balance when a purchase is confirmed. Without this, RevenueCat manages the entitlement but the backend doesn't know to add minutes to the user's balance. Let me add that now.

Summary of what's done:

Free trial: 300s → 120s (2 min) — both in code and migration ready to apply.

Weekly tiers defined:

Product ID	Price	Minutes
emmaline_pro_weekly_30min	$10/week	30 min
emmaline_pro_weekly_60min	$15/week	60 min
RevenueCat webhook: POST /api/billing/revenuecat-webhook — when RevenueCat sends an INITIAL_PURCHASE or RENEWAL event for one of the weekly products, the backend auto-grants the corresponding prepaid seconds.

What you need to do:

Run the migration: 20260714_reduce_free_trial_seconds.sql against your Supabase DB
In RevenueCat dashboard, create the two weekly products and link them to Google Play subscriptions
In RevenueCat → Integrations → add a webhook pointing to https://api.emmaline.app/api/billing/revenuecat-webhook
Keep the existing emmaline_pro_monthly for the monthly Pro tier

---

