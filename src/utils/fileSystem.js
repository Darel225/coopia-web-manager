/**
 * Utilitaire de gestion des fichiers (Double déploiement Web & Desktop)
 * Valide le critère Simplon Bloc 3 : "Lecture/écriture de fichiers"
 */

export function isElectronApp() {
  return typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);
}

/**
 * Sauvegarde un fichier localement
 * - Sur Desktop (Electron) : Ouvre le sélecteur natif Windows "Enregistrer sous..." et écrit directement sur le disque dur.
 * - Sur Web : Déclenche un téléchargement via le navigateur.
 */
export async function exportLocalReport({ filename = 'rapport-coopia.csv', content = '' }) {
  if (isElectronApp() && window.electronAPI?.saveReportToFile) {
    const result = await window.electronAPI.saveReportToFile({
      filename,
      content,
      filters: [
        { name: 'Fichier CSV', extensions: ['csv'] },
        { name: 'Fichier Texte', extensions: ['txt'] },
      ],
    });
    return { ...result, method: 'desktop' };
  }

  // Fallback universel pour navigateur Web
  try {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, method: 'web', filename };
  } catch (err) {
    console.error('Erreur export web:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Lit un fichier local depuis le disque dur
 * - Sur Desktop (Electron) : Ouvre la boîte de dialogue native Windows pour choisir un fichier.
 * - Sur Web : Ouvre le sélecteur de fichier HTML5 standard.
 */
export async function readLocalReport() {
  if (isElectronApp() && window.electronAPI?.readLocalFile) {
    const result = await window.electronAPI.readLocalFile({
      filters: [
        { name: 'Fichiers CSV / Données', extensions: ['csv', 'txt', 'json'] },
      ],
    });
    return { ...result, method: 'desktop' };
  }

  // Fallback pour navigateur Web
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt,.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        resolve({ success: false, canceled: true });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve({
          success: true,
          method: 'web',
          filename: file.name,
          content: event.target?.result,
        });
      };
      reader.onerror = () => resolve({ success: false, error: 'Erreur lecture fichier' });
      reader.readAsText(file);
    };
    input.click();
  });
}
