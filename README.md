<div align="center">

<img src="assets/images/icon-circle.png" alt="Entegram" width="96" height="96" style="border-radius:25%; border:4px " />

# Entegram

**Instagram without distractions**

<a href='https://github.com/govindpvenu/entegram/releases/latest' title='Download Entegram'>
<img src="https://raw.githubusercontent.com/rubenpgrady/get-it-on-github/refs/heads/main/get-it-on-github.png" alt="Get it on GitHub" height="72" />
</a>

[Download APK](https://github.com/govindpvenu/entegram/releases/latest/download/app.apk) · [Contribute](https://github.com/govindpvenu/entegram/fork) · [Report a Bug](https://github.com/govindpvenu/entegram/issues/new)

</div>

---

Entegram is an open source Expo app for using Instagram with fewer distractions.

## What it does

Entegram opens Instagram inside the app and lets you choose which distracting parts of the Instagram web experience should be hidden.

Current filters include:

- Hide Reels
- Hide Explore
- Hide Home Feed
- Hide Suggestions
- Hide Stories

The app also includes a LockIn mode that can protect enabled filters behind a password, so they cannot be turned off casually.

## How It Works

Entegram uses a React Native WebView to load the Instagram web version. Based on the filters you enable, the app injects a small script into the page that hides or blocks selected Instagram UI elements.

Filter settings are saved locally on the device. LockIn settings are also stored locally and are used to prevent protected filters from being disabled until they are unlocked.

## Disclaimer

Instagram updates its web version periodically, potentially breaking some functionality in Entegram. This project is not affiliated with Instagram or Meta.
