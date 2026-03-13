import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 앱 이름 강제 설정
app.name = "TOTAL 간호";

const DATA_PATH = path.join(app.getPath('userData'), 'patients.json');
const ICON_PATH = path.join(__dirname, 'public/total_nursing_icon.png');

function createWindow() {
  const icon = nativeImage.createFromPath(ICON_PATH);
  
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "TOTAL 간호", // 창 제목 강제 설정
  });

  // 제목이 바뀌지 않는 것을 방지하기 위해 한 번 더 설정
  mainWindow.setTitle("TOTAL 간호");

  // In development, load from the dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// IPC Handlers for Data Persistence
ipcMain.handle('load-data', () => {
  if (fs.existsSync(DATA_PATH)) {
    try {
      const data = fs.readFileSync(DATA_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load data:', e);
      return [];
    }
  }
  return [];
});

ipcMain.handle('save-data', (event, data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to save data:', e);
    return false;
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
