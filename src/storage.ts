export interface Preferences {
  mode: 'word' | 'line';
  guideColor: string;
  thickness: number;
}

export interface ReadingSession {
  id: string;
  startedAt: string;
  durationSeconds: number;
  source: 'camera' | 'demo';
}

export interface PagePointerData {
  version: 1;
  preferences: Preferences;
  sessions: ReadingSession[];
  exportedAt: string;
}

const DB_NAME = 'page-pointer';
const STORE = 'local-data';
const DEFAULTS: Preferences = { mode: 'word', guideColor: '#F7C948', thickness: 12 };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function read<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function write<T>(key: string, value: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getPreferences(): Promise<Preferences> {
  return { ...DEFAULTS, ...(await read<Preferences>('preferences')) };
}

export const savePreferences = (preferences: Preferences): Promise<void> => write('preferences', preferences);

export async function addSession(session: ReadingSession): Promise<void> {
  const sessions = (await read<ReadingSession[]>('sessions')) ?? [];
  await write('sessions', [session, ...sessions].slice(0, 50));
}

export async function exportData(): Promise<PagePointerData> {
  return {
    version: 1,
    preferences: await getPreferences(),
    sessions: (await read<ReadingSession[]>('sessions')) ?? [],
    exportedAt: new Date().toISOString()
  };
}

export async function importData(data: unknown): Promise<void> {
  if (!data || typeof data !== 'object' || (data as { version?: number }).version !== 1) throw new Error('This is not a Page Pointer export.');
  const parsed = data as PagePointerData;
  if (!Array.isArray(parsed.sessions) || !parsed.preferences || !['word', 'line'].includes(parsed.preferences.mode)) throw new Error('This export is incomplete or damaged.');
  await write('preferences', { ...DEFAULTS, ...parsed.preferences });
  await write('sessions', parsed.sessions.slice(0, 50));
}

export async function clearData(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
