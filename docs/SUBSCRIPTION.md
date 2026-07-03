Phase 1: Build The Shell
Do this before any store submission.

In RevenueCat, create the app entries for iOS and Android.
Copy the RevenueCat public SDK keys into your app env.
In RevenueCat, create:
entitlement: pro
offering: default
In Apple and Google, create the subscription products with the exact product IDs you want.
In RevenueCat, add those store products and attach them to the default offering and pro entitlement.
In the app, make sure these flows exist:
fetch offerings
show package/product
purchase
restore purchases
check entitlement state
Treat the paywall as “shell architecture” until the store products are usable. That means the app code is real, but the product catalog and store verification are still being proven.
At that point, RevenueCat is structurally set up even if nothing has been reviewed by Apple yet.

Phase 2: Unblock Android First
This is the fastest practical verification path.

Build a Play-compatible Android AAB, not the preview APK.
Upload that AAB to a closed testing track in Google Play.
Add test users in Play Console license testing / closed test.
Activate the subscription product in Google Play.
Wait for Play product propagation.
Install the closed-test build from Play, not by sideloading.
Test:
offerings load from RevenueCat
purchase sheet appears
test purchase succeeds
pro entitlement becomes active
restore works
Important point: the closed test does not generate a new “entitlement key.” What it gives you is a real Play Billing environment where RevenueCat can finally verify the subscription end to end.

Phase 3: Stabilize Before Apple Review
Do not submit to Apple review yet if login is still questionable.

Finish auth/login fixes in TestFlight or local device testing.
Keep RevenueCat wired to the real iOS product IDs.
Make sure the paywall and restore flow work at the app level.
Confirm the app is stable enough that a reviewer can create/sign in and reach subscription screens without getting stuck.
Phase 4: Apple First Subscription Submission
Apple is the annoying one.

Create the iOS subscription in App Store Connect.
Attach that subscription to the app version you plan to submit.
Submit the app build and first subscription together.
After approval, test again through TestFlight / sandbox as needed.

## Entitlements

The product has no Associated Entitlements attached.
I do not see evidence that the product is attached to an offering/package.

The likely missing setup is:

Attach the product emmaline_pro_monthly to the pro entitlement.
Go to Offerings and create or edit the current offering.
Add a monthly package to that offering and point it at emmaline_pro_monthly.
Make that offering the current offering.
Keep in mind that the App Store product itself is still only Ready to Submit, so even after wiring RevenueCat correctly, real purchase behavior may remain limited until Apple-side subscription setup is fully active.
The strongest signal from your screenshots is the empty Associated Entitlements section. That is definitely incomplete. If your Upgrade screen expects the pro entitlement and a current monthly offering, then this exact gap would explain the bad SDK message.

So the minimum fix in RevenueCat is:

Entitlements:
create or confirm pro
Products:
attach emmaline_pro_monthly to pro
Offerings:
current offering
Package:
monthly package using emmaline_pro_monthly
After that, the raw configuration error should stop for the right reason.

One nuance: because the product is still marked Ready to Submit, I would not expect App Store purchase flow to be fully trustworthy yet even after the RevenueCat dashboard wiring is fixed. But the offerings-empty/config error should improve once entitlement and offering linkage is complete.

Natural next steps:

Open Entitlements in RevenueCat and attach emmaline_pro_monthly to pro.
Open Offerings and confirm there is a current offering with a monthly package using that product.
Reopen the Upgrade screen in the app and see whether the configuration error disappears.
If you want, send me a screenshot of the Offerings page and the Entitlements page next, and I can verify the exact missing link.