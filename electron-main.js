import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 앱 이름 설정
// app.name = "TOTAL 간호";

const ICON_PATH = path.join(__dirname, 'public/total_nursing_icon.png');

function createWindow() {
  const icon = nativeImage.createFromPath(ICON_PATH);
  
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // In development, load from the dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
