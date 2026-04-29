### Important Next Steps for Foreground Service

The **foreground service plugin itself does not need any config** in `capacitor.config.json`. However, you **must** manually edit the native Android files:

1. **Open your Android project**:
   ```bash
   npx cap open android
   ```

2. **Edit `android/app/src/main/AndroidManifest.xml`**

   Add these **inside the `<application>`** tag:

   ```xml
   <receiver android:name="io.capawesome.capacitorjs.plugins.foregroundservice.NotificationActionBroadcastReceiver" />

   <service
       android:name="io.capawesome.capacitorjs.plugins.foregroundservice.AndroidForegroundService"
       android:foregroundServiceType="mediaPlayback" />
   ```

   **Why `mediaPlayback`?**
   Because you want to play sounds (ringtone) while the screen is off. Other useful types you might combine later: `dataSync`, `shortService`, etc. You can use multiple types separated by `|`.

3. Also add these permissions near the top (inside `<manifest>`):

   ```xml
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />           <!-- Helpful for audio -->
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" /> <!-- Android 13+ -->
   ```

4. After editing, run:
   ```bash
   npx cap sync android
   ```

### Would you like me to give you now:

- A clean example of how to start/stop the foreground service with a toggle (using `@capacitor/preferences` to remember the setting)?
- Recommended way to combine it with reliable audio playback (I suggest switching from `<audio>` to a native audio plugin)?
- How to run periodic HTTP requests safely inside the foreground service?

Just tell me what you want next (e.g., “give me the toggle code” or “show me the audio part”).

Also, after making the manifest changes, test on a real device:
- Turn on the toggle → minimize the app → turn screen off → see if the persistent notification appears and sound still plays every 5 seconds.

Let me know how it goes or what you need help with!
