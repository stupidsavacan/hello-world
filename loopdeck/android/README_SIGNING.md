# Building LoopDeck Android

LoopDeck's Android project packages the built Vite app as a local WebView wrapper. It consumes the files generated in `loopdeck/dist` and does not execute imported study packs as code.

## Debug APK

The repository includes:

```text
.github/workflows/loopdeck-android-debug.yml
```

Pull requests that touch LoopDeck run the web tests/build and then `assembleDebug`. The produced APK is uploaded as the short-lived `LoopDeck-debug-apk` artifact. Debug builds do not need signing secrets.

For a local build from the repository root:

```bash
cd loopdeck
npm install
npm test
npm run build
cd android
gradle --no-daemon assembleDebug
```

The Gradle `preBuild` hook synchronizes `loopdeck/dist` into `android/app/src/main/assets/loopdeck` before packaging.

## Local signed release

Release signing is intentionally not configured with real credentials in this repository. Copy the example file locally:

```bash
cp loopdeck/android/keystore.properties.example loopdeck/android/keystore.properties
```

Then edit `loopdeck/android/keystore.properties` with your local values:

```properties
storeFile=/absolute/path/to/your/loopdeck-release-key.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=YOUR_KEY_ALIAS
keyPassword=YOUR_KEY_PASSWORD
```

Run `assembleRelease` from `loopdeck/android`. If `keystore.properties` is missing or incomplete, debug builds still work and release builds fail with a clear signing error so an unsigned release is not mistaken for a signed APK.

## Safety rules

Never commit real signing material:

```text
*.jks
*.keystore
loopdeck/android/keystore.properties
```

`loopdeck/.gitignore` excludes these paths. Keep real signing credentials only in an appropriate local secret store or, if a release workflow is added later, in GitHub Actions Secrets rather than source files or logs.
