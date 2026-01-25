# Nuxt Ionic App

## Setup & Development

### Prerequisites
- Node.js (LTS version)
- Java 17 (Eclipse Adoptium/Temurin recommended)
- Android Studio / Android SDK
- Set JAVA_HOME to your Java 17 installation

### First-time Setup
```bash
npm install
npx cap add android
```
### Dev (In Windows PowerShell, not WSL)
```bash
npm run dev
```
# Building for Android

### Build the web app
```bash
npm run build
```

### Sync with Capacitor
```bash
npx cap sync
```

### Open in Android Studio or run directly
```bash
npx cap run android
```

### Deployment
```bash
npm run build
npx cap sync
npx cap run android  # For development
# OR open Android Studio for release builds
```

# Important Notes
Java Version Fix
This project requires Java 17. Capacitor may generate Java 21 configuration - the fix is in android/build.gradle (subprojects block).
If you get “invalid source release: 21” errors:
Verify JAVA_HOME points to Java 17
The Gradle override in android/build.gradle should handle it automatically
# Git Strategy
Committed: All source files and configuration

Ignored: Auto-generated files (build outputs, Capacitor-generated configs)
capacitor.build.gradle is auto-regenerated - our fixes are in the main build files

# Common Issues
Java version conflicts: Check JAVA_HOME and ensure it’s Java 17

Gradle caching issues: Run .\gradlew.bat --stop and .\gradlew.bat clean

Capacitor sync problems: Delete android directory and run npx cap add android again










# Created it like this:
npm create nuxt@latest ionic -- -t v3

npm install @ionic/vue @ionic/vue-router
npm install @nuxtjs/ionic

# For android:
npm install @capacitor/core @capacitor/android
npx cap init

# Then
npm run build

# Then
npx cap copy

# Installed for testing
sudo apt update
sudo apt install android-tools-adb

# From Windows:
install node
install SDK Platform Tools into e.g. c:/android
  https://developer.android.com/tools/releases/platform-tools
install cmdline-tools
#
```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest"
```
#
Set env for ANDROID_SDK_ROOT to c:/android

Update path for platform-tools and cmdline-tools/bin
#
cd "\\wsl$\Ubuntu\home\ubuntu\home\code\node\ionic"
