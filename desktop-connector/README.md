# C2E Desktop Connector

Desktop application that enables direct file opening in DaVinci Resolve and Adobe Premiere Pro from the C2E web platform.

## Features

- Protocol handler for `c2e://` URLs
- Automatic file download and caching
- Direct integration with DaVinci Resolve and Premiere Pro
- Cross-platform support (macOS, Windows, Linux)

## Installation

### Development

```bash
npm install
npm start
```

### Build

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

## How It Works

1. User clicks "Open in Editor" on the web platform
2. Web app sends `c2e://open?fileId=123&url=...` protocol URL
3. Desktop connector intercepts the URL
4. Downloads the video file to local cache
5. Launches DaVinci Resolve or Premiere Pro with the file

## Protocol Handler Registration

The app automatically registers itself as the handler for `c2e://` protocol URLs on first launch.

## Supported Editors

- DaVinci Resolve
- Adobe Premiere Pro
- Falls back to system default video app if neither is found
