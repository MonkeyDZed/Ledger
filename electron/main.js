const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextServer;

// Start Next.js server in production
function startNextServer() {
  return new Promise((resolve, reject) => {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      // In development, assume dev server is already running
      resolve();
      return;
    }

    // In production, start Next.js standalone server
    const nextPath = path.join(__dirname, '../.next/standalone/server.js');

    nextServer = spawn('node', [nextPath], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        PORT: '9002',
        NODE_ENV: 'production'
      }
    });

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('Ready') || data.toString().includes('started')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    // Fallback: resolve after 3 seconds even if we don't see "Ready"
    setTimeout(resolve, 3000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    title: 'LedgerSync V1.4.0',
    show: false,
    autoHideMenuBar: true,
  });

  // Wait for window to be ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load URL
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:9002/fr';

  mainWindow.loadURL(startUrl).catch((err) => {
    console.error('Failed to load URL:', err);
    // Retry after 2 seconds
    setTimeout(() => {
      mainWindow.loadURL(startUrl);
    }, 2000);
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    await startNextServer();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

// Handle app errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
