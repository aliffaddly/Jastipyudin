const LEGACY_BUSINESS_KEY = 'jastipyudin_state_v2';
const BUSINESS_BACKUP_KEY = 'jastipyudin_business_backup_v2';

export interface ArchivedBusinessData {
  archivedAt: string;
  sourceKey: string;
  snapshot: Record<string, unknown>;
}

export const getArchivedBusinessState = (): ArchivedBusinessData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(BUSINESS_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ArchivedBusinessData;
  } catch (error) {
    console.error('Failed to read archived business state', error);
    return null;
  }
};

export const migrateLegacyBusinessStateToBackup = (): ArchivedBusinessData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(LEGACY_BUSINESS_KEY);
    if (!raw) return null;

    const snapshot = JSON.parse(raw) as Record<string, unknown>;
    const backup: ArchivedBusinessData = {
      archivedAt: new Date().toISOString(),
      sourceKey: LEGACY_BUSINESS_KEY,
      snapshot,
    };

    window.localStorage.setItem(BUSINESS_BACKUP_KEY, JSON.stringify(backup));
    window.localStorage.removeItem(LEGACY_BUSINESS_KEY);

    return backup;
  } catch (error) {
    console.error('Failed to migrate legacy localStorage state to backup', error);
    return null;
  }
};

export const clearBusinessLocalStorage = (): void => {
  if (typeof window === 'undefined') return;

  const keysToClear = [LEGACY_BUSINESS_KEY, BUSINESS_BACKUP_KEY];
  keysToClear.forEach((key) => window.localStorage.removeItem(key));
};
