const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    title: 'CoopIA Manager — Tour de Contrôle Agricole',
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: '#FAF8F5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  });

  // Menu natif de l'application Desktop
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouvelle fenêtre',
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow(),
        },
        { type: 'separator' },
        {
          label: 'Quitter CoopIA Manager',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Recharger', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Plein écran', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Outils de développement (Inspecter)', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWindow.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Aide & Certification',
      submenu: [
        {
          label: 'À propos de CoopIA Manager',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'CoopIA Manager Desktop v1.0.0',
              message: 'CoopIA Manager — Plateforme Décisionnelle & Intelligence Agricole',
              detail: 'Développé pour la gestion des coopératives agricoles de Côte d\'Ivoire (Campagne 2025-2026).\nCertification Développeur Data IA Simplon Côte d\'Ivoire.\nTechnologie : React + Vite + Tailwind + FastAPI + Electron.js.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Chargement de l'application packagée (index.html généré par Vite)
  const indexPath = path.join(__dirname, '../dist/index.html');

  if (fs.existsSync(indexPath)) {
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('[Renderer Console]', message);
  });
  mainWindow.loadFile(indexPath);
  } else {
    // Mode développement : Si le bundle dist n'existe pas, charger le serveur local Vite
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers pour la validation du Bloc 3 (Lecture / Écriture de fichiers locaux)
ipcMain.handle('save-report', async (event, { filename, content, filters }) => {
  if (!mainWindow) return { success: false, error: 'Fenêtre principale introuvable' };

  try {
    const defaultPath = path.join(app.getPath('documents'), filename || 'rapport-coopia.csv');
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Enregistrer le rapport CoopIA sur votre ordinateur',
      defaultPath,
      filters: filters || [
        { name: 'Fichier CSV', extensions: ['csv'] },
        { name: 'Fichier Texte', extensions: ['txt'] },
      ],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, filePath };
  } catch (err) {
    console.error('Erreur save-report:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('read-local-file', async (event, { filters }) => {
  if (!mainWindow) return { success: false, error: 'Fenêtre principale introuvable' };

  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Sélectionner un fichier de données local',
      properties: ['openFile'],
      filters: filters || [
        { name: 'Fichiers compatibles', extensions: ['csv', 'txt', 'json'] },
      ],
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const filePath = filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    return { success: true, filePath, filename, content };
  } catch (err) {
    console.error('Erreur read-local-file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-desktop-info', async () => {
  return {
    isDesktop: true,
    platform: process.platform,
    version: app.getVersion(),
    appPath: app.getAppPath(),
  };
});

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
