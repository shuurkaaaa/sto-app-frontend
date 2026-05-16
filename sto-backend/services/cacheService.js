const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../cache');
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const memoryCache = new Map();

class CacheService {
  static get(key) {
    if (memoryCache.has(key)) {
      const cached = memoryCache.get(key);
      if (!this._isExpired(cached)) {
        return cached.data;
      }
      memoryCache.delete(key);
    }

    const filePath = this._getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const cached = JSON.parse(fileContent);

        if (!this._isExpired(cached)) {
          memoryCache.set(key, cached);
          return cached.data;
        }
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`[Cache] Помилка читання кешу ${key}:`, error.message);
      }
    }

    return null;
  }

  static set(key, data) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_DURATION,
    };

    memoryCache.set(key, cacheEntry);

    const filePath = this._getCacheFilePath(key);
    try {
      fs.writeFileSync(filePath, JSON.stringify(cacheEntry, null, 2));
    } catch (error) {
      console.error(`[Cache] Помилка запису кешу ${key}:`, error.message);
    }

    return data;
  }

  static delete(key) {
    memoryCache.delete(key);

    const filePath = this._getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`[Cache] Помилка видалення ${key}:`, error.message);
      }
    }
  }

  static clear() {
    memoryCache.clear();

    try {
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      });
    } catch (error) {
      console.error('[Cache] Помилка очищення:', error.message);
    }
  }

  static getStats() {
    let diskCacheSize = 0;
    let fileCount = 0;

    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      fileCount = files.length;

      files.forEach(file => {
        const filePath = path.join(CACHE_DIR, file);
        const stats = fs.statSync(filePath);
        diskCacheSize += stats.size;
      });
    }

    return {
      memoryCacheSize: memoryCache.size,
      diskCacheFiles: fileCount,
      diskCacheSizeKB: (diskCacheSize / 1024).toFixed(2),
    };
  }

  static _isExpired(cacheEntry) {
    const now = Date.now();
    const age = now - cacheEntry.timestamp;
    return age > cacheEntry.ttl;
  }

  static _getCacheFilePath(key) {
    const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(CACHE_DIR, `${safeKey}.json`);
  }
}

module.exports = CacheService;
