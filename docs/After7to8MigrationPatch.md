**This is a common issue** after upgrading to **Capacitor 8**, which bumps Kotlin to version **2.2.20** (from the older 1.x series). Some plugins or transitive dependencies are still pulling in the old `kotlin-stdlib-jdk7` and `kotlin-stdlib-jdk8` jars, causing duplicate classes.

This is **not** directly caused by the foreground service plugin, but by the upgrade itself.

### Quick Fix (Recommended)

Open this file in your Android project:

**`android/app/build.gradle`**

Add the following block **inside the `dependencies { }`** section (usually near the bottom):

```gradle
dependencies {
    // ... existing dependencies

    // === FIX FOR KOTLIN DUPLICATE CLASSES ===
    constraints {
        implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22") {
            because("kotlin-stdlib-jdk7 is now part of kotlin-stdlib")
        }
        implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22") {
            because("kotlin-stdlib-jdk8 is now part of kotlin-stdlib")
        }
    }
}
```

This forces the old conflicting versions to align with the newer `kotlin-stdlib` that Capacitor 8 uses.

### After Adding the Fix

1. Save the file.
2. Run these commands in order:

```bash
npx cap sync android
npx cap run android
```

Or if you prefer building from Android Studio:
- Close and reopen the project in Android Studio
- Click **Sync Project with Gradle Files** (elephant icon)
- Then try Build → Make Project or run the app

### Alternative / Stronger Fix (if the above doesn't work)

If you still get errors, replace the constraints block with this more aggressive version:

```gradle
configurations.all {
    resolutionStrategy {
        force "org.jetbrains.kotlin:kotlin-stdlib:2.2.20"
        force "org.jetbrains.kotlin:kotlin-stdlib-jdk7:2.2.20"
        force "org.jetbrains.kotlin:kotlin-stdlib-jdk8:2.2.20"
    }
}
```

### Extra Tips

- Run `npx cap doctor` to see if there are any obvious version mismatches.
- Make sure all your Capacitor plugins are on version **^8.x** (especially `@capacitor/android`, local-notifications, preferences, etc.).
- After fixing, clean the build if needed:
  ```bash
  cd android && ./gradlew clean
  ```

---

Try the first solution (the `constraints` block) first — it resolves this exact error for most people after a Capacitor 8 upgrade.

Let me know what happens after you add it and run `npx cap sync android` again.

If it still fails, please paste the **new error message** (or the first few lines after the change), and we’ll go deeper (possibly updating Gradle or Kotlin version manually).

Once the build succeeds, we can go back to testing the simple foreground service toggle.
