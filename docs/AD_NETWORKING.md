# Networking architecture

## Ads set up
Ad-rewarded feature:
"Ad-Triggered Actions: Instead of random pop-ups, use a Rewarded Interstitial ad format. Require the user to watch a 5-second video specifically to "unlock" a long transcription or article read-aloud. Users accept ads much better when it directly grants them a feature."

Ad framework
Because a 1-hour file costs $0.013 to process, a single standard pop-up ad ($0.010) leaves you at a slight loss. To make this profitable, you must adapt your ad strategy for long-form content.Instead of one random pop-up, you use two strategic ad placements:The 
- Entry Ad: A standard interstitial pop-up when they hit "Transcribe".
- The Processing Ad: While the server spends 90 seconds transcribing the file, you display a native video ad or a rewarded countdown on the processing screen.

Higher paying ad types
- playable game ads (eCpm 15 to 30)
- 15 second ads lead to about 2.5c per watch

User uploads a 1-hour file 
   │
   ├──> [Ad #1: Interstitial Pop-up] ──────> Earns you: +$0.010
   │
   ├──> [90-Second Server Processing Screen]
   │    └──> Displays a 15s Video Ad ───────> Earns you: +$0.020
   │
   └──> Final Transcription Delivered 


## ⚙️ Official Integration Links

* 
* Step-by-Step Setup Guide: Read through the [AppLovin MAX React Native Integration Documentation](https://support.applovin.com/en/max/react-native/overview/integration) to learn how to properly configure initialize frameworks, Promises, and listener callbacks. [2] 
* The SDK Code Library: You can access the open-source repository directly on the [AppLovin MAX React Native GitHub](https://github.com/AppLovin/AppLovin-MAX-React-Native) to check out sample implementations and submit technical bug tracker issues. [3, 4] 
* NPM Package: Download the official [react-native-applovin-max NPM Package](https://npmjs.com/package/react-native-applovin-max) to add the core dependency directly into your terminal repository. [5] 
* 

------------------------------
## 🚀 3 Quick Rules for First-Time Setup Success
Because you are taking action for the first time, follow this specific workflow sequence to guarantee you don't run into early compliance roadblocks:

   1. Start in Dashboard First: Establish your base platform account using the [AppLovin MAX Getting Started Guide](https://support.applovin.com/en/max/getting-started), fill out your primary developer profile info, and immediately create your first "Ad Unit ID" for an Interstitial ad. [6] 
   2. Build Your Code Safely: Install the package, hook up your AppLovinMAX.initialize() function, and immediately drop in your device’s test ID. [5] 
   3. Verify the Watermark: Run your development build, trigger the pop-up, and physically verify that the explicit "Test Ad" text banner displays across the screen before pushing it live to any public stores.

------------------------------
Since you're executing this setup now, what specific state management (like standard React Hooks or Redux) are you using to manage whether your app is loading data while the ad prepares to pop up? I can write out the exact listener framework for you!

[1] [https://www.youtube.com](https://www.youtube.com/watch?v=B36ksL6L-NU&t=381)
[2] [https://support.applovin.com](https://support.applovin.com/en/max/react-native/overview/integration)
[3] [https://github.com](https://github.com/AppLovin/AppLovin-MAX-React-Native)
[4] [https://github.com](https://github.com/AppLovin/AppLovin-MAX-SDK-Android)
[5] [https://npmjs.com](https://npmjs.com/package/react-native-applovin-max)
[6] [https://support.applovin.com](https://support.applovin.com/en/max/getting-started)


# Security

To secure your React Native app with AppLovin immediately and prevent invalid traffic (IVT) bans, you must implement strict technical and design safeguards before serving your first live pop-up.
## 1. Hardcode Your Device as a Test Device (Mandatory)
Never click or load live ads on your own phone during development. AppLovin will instantly flag repeated requests from the same IP/device as click fraud. In your React Native code, you must explicitly register your test device ID.

// Example using standard AppLovin React Native SDK setupimport AppLovinMAX from 'react-native-applovin-max';
// Initialize the SDK and pass your test device IDs
AppLovinMAX.initialize("YOUR_SDK_KEY", (configuration) => {
  // Add your advertising ID (GAID for Android, IDFA for iOS)
  AppLovinMAX.setTestDeviceAdvertisingIds(["YOUR_TEST_DEVICE_ID"]);
});


* How to find your ID: Use a free "My Device ID" app from the Google Play Store or App Store to copy your exact Advertising ID.

## 2. Implement a "Time-Pacing" Cap
Do not let users trigger pop-ups back-to-back. Create a simple timestamp check in your React Native state or storage. If the user triggers an action that spawns a pop-up, verify that at least 120 to 180 seconds have passed since the last ad.

let lastAdShownTime = 0;const AD_COOLDOWN_MS = 120000; // 2 minutes
function tryShowingInterstitial() {
  const currentTime = Date.now();
  if (currentTime - lastAdShownTime > AD_COOLDOWN_MS) {
    if (AppLovinMAX.isInterstitialReady(INTERSTITIAL_AD_UNIT_ID)) {
      AppLovinMAX.showInterstitial(INTERSTITIAL_AD_UNIT_ID);
      lastAdShownTime = currentTime;
    }
  } else {
    console.log("Ad blocked by local fraud-prevention pacing cap.");
    // Proceed with the app flow smoothly without showing an ad
  }
}

## 3. Deploy an app-ads.txt File Immediately
Ad networks use this file to verify that you own the app selling the ad space. If you do not have one, malicious bots can spoof your app ID, generate fake clicks, and get your account banned. [1] 

   1. Create a plain text file named app-ads.txt.
   2. Add AppLovin’s specific seller line (found inside your AppLovin dashboard under Account > App-Ads.txt Info). It looks like this:
   applovin.com, ACCOUNT_ID, DIRECT, c4dc1b444da605b9
   3. Upload this file to the root directory of the developer website listed on your Google Play Console or Apple App Store Connect account (e.g., https://yourdomain.com). [2] 

## 4. Use "Safe Zones" in Your UI Layout
Pop-up ads take a fraction of a second to load over data networks. If an ad pops up exactly where a user is repeatedly tapping (like a "Next" or "Submit" button), they will accidentally click the ad.

* The Rule: Only trigger interstitials at natural breaks where the user has completely stopped tapping. For example, right after a form successfully submits and the screen changes, or when transitioning between two distinct menus. Never trigger an ad mid-action. [3] 

## 5. Filter Out Low-Quality Traffic Regions
If you run paid user-acquisition campaigns to get your first users, completely avoid cheap click-farms or unverified ad networks. AppLovin monitors your traffic quality. If 80% of your app installs come from suspicious emulator networks or bot-heavy regions that immediately click ads and close the app, your account will be suspended. Stick to organic traffic or trusted ad networks for your initial launch. [4, 5] 
------------------------------
To ensure your setup is completely air-tight, tell me:

* Do you already have a developer website domain set up for your app?
* Which React Native AppLovin wrapper library are you planning to install?

I can provide the exact code block to initialize it securely.

[1] [https://www.start.io](https://www.start.io/wp-content/uploads/2025/07/STR_Mobile-app-monetization-best-practices_V.1.0.pdf)
[2] [https://liftoff.ai](https://liftoff.ai/blog/how-app-ads-txt-earns-publishers-more-revenue-drives-down-mobile-fraud/)
[3] [https://mobivery.com](https://mobivery.com/en/in-app-ads/)
[4] [https://applovin.com](https://applovin.com/platform-enforcement)
[5] [https://www.redtrack.io](https://www.redtrack.io/blog/how-to-prevent-ad-fraud/)

Yes, registering your devices as test devices makes it completely safe to develop, build, and test your app without risking a click fraud ban.
## What Happens When You Register a Test Device?

* Safe to Click: You can view the ads, click them, and completely go through the ad flows. AppLovin flags all traffic from that specific device ID as "Test Data" on their servers, meaning no money is generated and no advertiser is billed. [1] 
* Easy to Exit: The pop-up ads will function normally, allowing you to click the "X" or "Close" button to exit out of them and test how your app resumes its normal behavior.
* Works Across All Builds: This safety applies to all build types (Development builds, Expo Go, Staging, or even Release builds) as long as the device you are holding is registered in your code or dashboard.

------------------------------
## How to Ensure Your Test Setup is 100% Active
To be absolutely certain you are safe, verify these two visual and technical indicators:
## 1. Look for the "Test Ad" Watermark
When an interstitial pop-up appears on your registered device, AppLovin will overlay a visible "Test Ad" label or banner across the screen. If you see that watermark, your fraud protection is active. If you see a real corporate ad without any "Test" label, do not click it—your device ID is not being recognized properly.
## 2. Handle iOS 14+ Privacy Restrictions (Crucial for React Native)
On iOS devices, Apple hides your App Tracking Transparency (ATT) ID by default. If your app hasn't requested tracking permission, your device ID will return as all zeros (00000000-0000-0000-0000-000000000000), causing AppLovin to miss your test device registration. [2] 
To fix this during development, you must use AppLovin's Mediation Debugger tool inside your app. It provides a visual interface to verify your test status:

// Trigger this button somewhere in your developer/admin menu
AppLovinMAX.showMediationDebugger();

Opening this screen will tell you exactly whether AppLovin recognizes your phone as a safe test device or a live production device.
------------------------------
If you want to set up the device registration correctly on your current setup, let me know:

* Are you testing on an Android device, an iPhone, or an emulator/simulator?
* Are you using Expo or bare React Native CLI to run your development builds?

I can give you the specific steps to extract your exact ID for that platform.

[1] [https://support.google.com](https://support.google.com/admob/thread/283634420/do-i-have-to-set-testingdevices-ids-for-my-closed-tesing-campain?hl=en)
[2] [https://developer.apple.com](https://developer.apple.com/videos/play/wwdc2022/10166/)


*written by google.com/ai*