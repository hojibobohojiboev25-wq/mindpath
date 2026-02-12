const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'mindpath-store')
  : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'runtime-store.json');

const DEFAULT_STORE = {
  chat: {
    messages: [
      {
        id: 'seed-1',
        userId: 'system',
        userName: 'System',
        userAvatar: '🤖',
        content: 'Welcome to global chat.',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
    ],
    users: {}
  },
  analysisResults: {}
};

let updateQueue = Promise.resolve();

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
  }
}

function readStoreSync() {
  ensureStore();
  const raw = fs.readFileSync(STORE_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORE,
      ...parsed,
      chat: {
        ...DEFAULT_STORE.chat,
        ...(parsed.chat || {})
      }
    };
  } catch {
    fs.writeFileSync(STORE_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
    return { ...DEFAULT_STORE };
  }
}

function writeStoreSync(store) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function getStore() {
  return readStoreSync();
}

function updateStore(mutator) {
  updateQueue = updateQueue
    .catch(() => null)
    .then(async () => {
      const store = readStoreSync();
      const next = mutator(store) || store;
      writeStoreSync(next);
      return next;
    });
  return updateQueue;
}

module.exports = {
  getStore,
  updateStore
};

