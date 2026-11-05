# 10. Setup and services

## Accounts you need
| Service | For | Notes |
|---|---|---|
| Expo (EAS) | builds and updates | free tier works for development |
| Supabase | database, auth, storage, functions | create one project for dev and one for production |
| Apple Developer Program | iOS builds, in-app purchase | paid yearly |
| Google Play Console | Android release, in-app purchase | one time fee |
| RevenueCat | subscriptions | connect to both stores |
| AI provider | AI answers and card reading | one API key, kept only in Supabase secrets |
| SMS provider for phone OTP | sign in | connect inside Supabase Auth. For development use Supabase test phone numbers (check current Supabase docs) |
| Google Cloud OAuth client | Google sign in | |
| Domain | public card links and universal links | `APP_DOMAIN` below is a placeholder (`recallr.app`), choose and buy the real one |
| Hosting for `public-card-web` | public card page | any static or serverless host |

## Environment variables
App (`.env`, prefix `EXPO_PUBLIC_` means it is visible in the app, so only public values):
| Name | Value |
|---|---|
| EXPO_PUBLIC_SUPABASE_URL | Supabase project URL |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key |
| EXPO_PUBLIC_APP_DOMAIN | domain for card links, for example recallr.app |
| EXPO_PUBLIC_REVENUECAT_IOS_KEY | RevenueCat public iOS SDK key |
| EXPO_PUBLIC_REVENUECAT_ANDROID_KEY | RevenueCat public Android SDK key |
| EXPO_PUBLIC_PRIVACY_URL, EXPO_PUBLIC_TERMS_URL, EXPO_PUBLIC_HELP_URL | legal and help pages |

Server (Supabase secrets, NEVER in the app):
| Name | Value |
|---|---|
| AI_PROVIDER_API_KEY | AI provider key |
| AI_MODEL | model name for chat |
| AI_VISION_MODEL | model name for card scanning |
| REVENUECAT_WEBHOOK_SECRET | shared secret to verify webhooks |
| SUPABASE_SERVICE_ROLE_KEY | provided to functions by Supabase, never exposed |

Add `.env` to `.gitignore`. Provide `.env.example` with names only.

## Commands (verify against current docs if a command fails)
```
npx create-expo-app@latest recallr
npx expo install <package>          # for Expo compatible packages
supabase init
supabase link --project-ref <ref>
supabase db push                    # applies supabase/migrations
supabase gen types typescript --linked > src/lib/database.types.ts
supabase secrets set AI_PROVIDER_API_KEY=... AI_MODEL=...
supabase functions deploy <function-name>
npx expo start
eas build --profile development --platform android   # and ios
```

## RevenueCat setup checklist
1. Create products in App Store Connect and Google Play with a 7 day free trial.
2. In RevenueCat create entitlement `pro`, an offering with Monthly and Yearly packages, and link the products.
3. Add the webhook URL of the `revenuecat-webhook` function and the secret.
4. Test with sandbox accounts before release.

## Store requirements to remember
- A visible Restore purchases button, clear price and trial text, links to Terms and Privacy.
- Account deletion inside the app (provided in Settings).
- Privacy policy URL and data safety or privacy label answers (contacts, photos, notifications, camera).
