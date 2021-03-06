let manifest = {
  "name": "one-bookmark-chrome-extension",
  "description" : "One Bookmark for Chrome extension",
  "version": "0.0.1",
  "browser_action": {
    "default_popup": "popup.html",
    "default_icon": "assets/logo.png"
  },
  "manifest_version": 2,
  "background": {
    "scripts": ["./background.js"],
    "persistent": true
  },
  "permissions": [
    "nativeMessaging",
    "bookmarks"
  ],
  "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"
};

module.exports = manifest;
