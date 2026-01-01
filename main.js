const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// ESTO HACE QUE SEA REALMENTE PORTABLE:
// Guarda los datos (cache, localstorage) en una carpeta 'data' junto al exe

app.setPath('userData', path.join(process.cwd(), 'data'));
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      plugins: true,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, 
      sandbox: false      
    }
  });

  win.loadFile('Gestor_prompts.html');
}

// Escuchador para seleccionar carpeta
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (canceled) return null;
  return filePaths[0];
});

// Alternar "siempre encima"
ipcMain.on('set-always-on-top', (event, value) => {
  if (win) win.setAlwaysOnTop(value);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
// Escuchador para Guardar Archivo (Exportar)
ipcMain.handle('dialog:saveFile', async (event, options = {}) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: options.title || 'Guardar archivo',
    defaultPath: options.defaultPath || path.join(app.getPath('documents'), 'archivo'),
    // Quitamos los filtros fijos para que sirva para imágenes también
  });
  if (canceled) return null;
  return filePath;
});

// Escuchador para Abrir Archivo (Importar)
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Seleccionar archivo de Prompts',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (canceled) return null;
  return filePaths[0];
});
const fs = require('fs'); // Asegúrate de que fs esté requerido arriba

ipcMain.handle('create-directory', async (event, dirPath) => {
  if (!fs.existsSync(dirPath)){
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
  }
  return false;
});

// Permite que el HTML sepa en qué carpeta se está ejecutando el .exe
ipcMain.handle('get-app-path', () => {
  return process.cwd();
});
