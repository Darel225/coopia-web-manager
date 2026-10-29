const { contextBridge, ipcRenderer } = require('electron');

/**
 * Passerelle sécurisée (Context Isolation) entre l'application React et le système d'exploitation Windows.
 * Permet au tableau de bord CoopIA d'appeler les fonctionnalités natives Desktop (lecture/écriture de fichiers).
 */
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  
  // Écriture d'un fichier sur le disque dur local (dialogue natif Windows)
  saveReportToFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // Lecture d'un fichier local depuis le disque dur
  readLocalFile: (data) => ipcRenderer.invoke('read-file', data),
  
  // Informations système de l'application Desktop
  getDesktopInfo: () => ipcRenderer.invoke('get-desktop-info')
});
