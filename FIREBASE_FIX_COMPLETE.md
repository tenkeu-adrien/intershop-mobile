# Firebase Initialization Fix - Complete

## Problem
The app was crashing with error: `Component auth has not been registered yet`

## Root Cause
Firebase Auth was being initialized multiple times:
1. In `src/config/firebase.ts` at module load
2. In `src/store/authStore.ts` with `onAuthStateChanged` at module load
3. This caused a race condition where Auth tried to register before Firebase was ready

## Solution Applied

### 1. Fixed Firebase Configuration (`src/config/firebase.ts`)
- Added `getApps()` check to prevent double initialization
- Added fallback demo values for environment variables
- Proper try-catch for Auth initialization

### 2. Fixed Auth Store (`src/store/authStore.ts`)
- Moved `onAuthStateChanged` listener from module level to a function `initAuthListener()`
- This prevents Auth from being accessed before Firebase is ready
- Added `initAuthListener` to the store interface

### 3. Updated Root Layout (`app/_layout.tsx`)
- Call `initAuthListener()` in useEffect after component mounts
- This ensures Firebase is fully initialized before setting up listeners

### 4. Fixed ProductDetailScreen
- Removed incorrect import `../lib/firebase/products` (directory doesn't exist)
- Created inline `getProduct` function instead

### 5. Created .env File
- Added demo Firebase configuration values
- App can now start even without real Firebase keys

## Files Modified
1. `intershop-mobile/src/config/firebase.ts`
2. `intershop-mobile/src/store/authStore.ts`
3. `intershop-mobile/app/_layout.tsx`
4. `intershop-mobile/src/screens/ProductDetailScreen.tsx`
5. `intershop-mobile/.env` (created)

## Next Steps

### To Use Real Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add a Web app to your project
4. Copy the configuration values
5. Update `.env` file with real values:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_real_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
6. Restart the Expo dev server: `npm start -c`

### To Test the App:
```bash
# Clear cache and restart
npm start -c

# Or just restart
npm start
```

## What Should Work Now
✅ App launches without Firebase errors
✅ No "Component auth has not been registered yet" error
✅ Auth listener initializes properly after app loads
✅ All screens load without import errors
✅ Firebase is ready for real configuration

## Important Notes
- The demo Firebase values will NOT connect to a real database
- You MUST add real Firebase keys to use authentication, database, and storage
- The app structure is now correct and ready for real Firebase integration
- All stores (auth, cart, chat, wallet, etc.) are properly configured
