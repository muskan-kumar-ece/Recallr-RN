# 10. Firebase setup

## Services

| Service | Use | Setup |
|---|---|---|
| Firebase | Auth, Cloud Firestore, Cloud Storage, Cloud Functions, Hosting | Use the Recallr Firebase project for development and production environments. |
| Expo (EAS) | iOS and Android builds | Configure development and production profiles. |
| Google OAuth | Google sign-in on web and mobile | Enable Google in Firebase Authentication and configure the platform OAuth client IDs. |
| Razorpay | Subscription payment orders | Configure test keys for development and live keys for production. |
| Gemini | AI answers and card reading | Store the API key as a Firebase Functions secret. |
| Domain | Public card links and app links | Configure `EXPO_PUBLIC_APP_DOMAIN` and the associated universal links. |

Remote reminder delivery also requires Cloud Scheduler enabled for the Firebase project, an Android app registered with its `google-services.json`, and an APNs authentication key configured in Firebase for iOS. Remote notifications require native development or production builds; Expo Go is not a delivery target.

## App environment variables

Create local `.env.local` files from the examples. These values are public Firebase app configuration or OAuth client IDs; never put server credentials here.

| Name | Use |
|---|---|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` / `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_API_KEY` / `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase client configuration key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` / `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` / `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` / `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` / `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client ID used by the mobile sign-in flow |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client ID used by the mobile sign-in flow |

Enable Google and Phone sign-in in Firebase Authentication. Native Google sign-in also requires platform OAuth client IDs, the Android signing SHA-1 fingerprints, and the app redirect URI configured in the Google/Firebase project. Never place an OAuth client secret in the app. Emulator and provider verification must pass before release.
| `EXPO_PUBLIC_APP_DOMAIN` | Public card and deep-link domain |

Firebase client configuration keys are not authorization credentials. Firestore and Storage access is controlled by `firestore.rules` and `storage.rules`.

## Server secrets

Set these with Firebase Functions secrets. Never add them to an app environment file or commit their values.

| Secret | Use |
|---|---|
| `GEMINI_API_KEY` | Gemini AI and card scanning |
| `RAZORPAY_KEY_ID` | Server-side Razorpay order and payment lookup |
| `RAZORPAY_KEY_SECRET` | Razorpay signatures and API authentication |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signature verification |

## Local development

```sh
pnpm install
firebase emulators:start --only auth,firestore,storage,functions
pnpm dev:web
pnpm dev:mobile
```

Configure the Firebase emulator host in the app when testing locally. Do not point local development at production data.

## Deploying backend changes

Review Firestore and Storage rules before deployment. Cloud Functions require configured secrets before payment or AI calls will work.

```sh
firebase deploy --only firestore:rules,storage,functions
```

Production deployment is a separate release action; do not run it as part of local testing.
