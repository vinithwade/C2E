const { app, protocol, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const os = require('os');

let mainWindow;
const CACHE_DIR = path.join(os.homedir(), '.c2e', 'cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Register custom protocol handler
app.setAsDefaultProtocolClient('c2e');

// Handle protocol URLs (c2e://open?fileId=123&url=...)
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
});

// Windows/Linux protocol handling
if (process.platform === 'win32' || process.platform === 'linux') {
  app.on('second-instance', (event, commandLine) => {
    // Find protocol URL in command line arguments
    const url = commandLine.find((arg) => arg.startsWith('c2e://'));
    if (url) {
      handleProtocolUrl(url);
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function handleProtocolUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const fileId = params.get('fileId');
    const videoUrl = params.get('url');

    if (fileId && videoUrl) {
      openInEditor(fileId, decodeURIComponent(videoUrl));
    }
  } catch (error) {
    console.error('Error parsing protocol URL:', error);
  }
}

function openInEditor(fileId, videoUrl) {
  // Download file to cache
  const filePath = path.join(CACHE_DIR, `${fileId}.mp4`);
  
  // Show notification
  if (mainWindow) {
    mainWindow.webContents.send('download-start', { fileId, filePath });
  }

  // Download file
  axios({
    method: 'get',
    url: videoUrl,
    responseType: 'stream',
  })
    .then((response) => {
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    })
    .then(() => {
      // Launch DaVinci Resolve or Premiere Pro
      launchEditor(filePath);
      
      if (mainWindow) {
        mainWindow.webContents.send('download-complete', { fileId, filePath });
      }
    })
    .catch((error) => {
      console.error('Download error:', error);
      if (mainWindow) {
        mainWindow.webContents.send('download-error', { fileId, error: error.message });
      }
    });
}

function launchEditor(filePath) {
  const platform = process.platform;
  let editorPath;
  let editorArgs = [filePath];

  // Detect installed editors
  if (platform === 'darwin') {
    // macOS
    const davinciPath = '/Applications/DaVinci Resolve/DaVinci Resolve.app';
    const premierePath = '/Applications/Adobe Premiere Pro 2024/Adobe Premiere Pro 2024.app';

    if (fs.existsSync(davinciPath)) {
      editorPath = 'open';
      editorArgs = ['-a', 'DaVinci Resolve', filePath];
    } else if (fs.existsSync(premierePath)) {
      editorPath = 'open';
      editorArgs = ['-a', 'Adobe Premiere Pro 2024', filePath];
    } else {
      // Fallback: try to open with default app
      editorPath = 'open';
      editorArgs = [filePath];
    }
  } else if (platform === 'win32') {
    // Windows
    const davinciPath = 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe';
    const premierePath = 'C:\\Program Files\\Adobe\\Adobe Premiere Pro 2024\\Adobe Premiere Pro.exe';

    if (fs.existsSync(davinciPath)) {
      editorPath = davinciPath;
    } else if (fs.existsSync(premierePath)) {
      editorPath = premierePath;
    } else {
      // Fallback: use default handler
      editorPath = 'start';
      editorArgs = ['', filePath];
    }
  } else {
    // Linux
    editorPath = 'xdg-open';
  }

  spawn(editorPath, editorArgs, { detached: true, stdio: 'ignore' });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false, // Hide by default, show only when needed
  });

  // Load a simple status page
  mainWindow.loadFile('index.html');

  // Show window only when there's activity
  ipcMain.on('show-window', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  ipcMain.on('hide-window', () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle command line arguments (for Windows/Linux)
if (process.platform === 'win32' || process.platform === 'linux') {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    const url = process.argv.find((arg) => arg.startsWith('c2e://'));
    if (url) {
      handleProtocolUrl(url);
    }
  }
}
