/**
 * Кеш-сервіс для зберігання результатів скрапінгу
 * Тримає дані в пам'яті та на диску (для персистентності)
 */

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../cache');
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 днів в мс

// Переконатися, що директорія для кешу існує
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Кеш в пам'яті
const memoryCache = new Map();

class CacheService {
  /**
   * Отримати значення з кешу
   */
  static get(key) {
    // Спочатку шукаємо в пам'яті
    if (memoryCache.has(key)) {
      const cached = memoryCache.get(key);
      if (!this._isExpired(cached)) {
        console.log(`[Cache] ✓ Знайдено в пам'яті: ${key}`);
        return cached.data;
      } else {
        memoryCache.delete(key);
      }
    }

    // Потім шукаємо на диску
    const filePath = this._getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const cached = JSON.parse(fileContent);
        
        if (!this._isExpired(cached)) {
          console.log(`[Cache] ✓ Знайдено на диску: ${key}`);
          // Повернути дані в пам'ять
          memoryCache.set(key, cached);
          return cached.data;
        } else {
          fs.unlinkSync(filePath);
          console.log(`[Cache] ✗ Кеш застарів: ${key}`);
        }
      } catch (error) {
        console.error(`[Cache] Помилка читання кешу ${key}:`, error.message);
      }
    }

    console.log(`[Cache] ✗ Кеш не знайдено: ${key}`);
    return null;
  }

  /**
   * Зберегти значення в кеш
   */
  static set(key, data) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_DURATION,
    };

    // Зберегти в пам'ять
    memoryCache.set(key, cacheEntry);

    // Зберегти на диск
    const filePath = this._getCacheFilePath(key);
    try {
      fs.writeFileSync(filePath, JSON.stringify(cacheEntry, null, 2));
      console.log(`[Cache] ✓ Зберено в кеш: ${key}`);
    } catch (error) {
      console.error(`[Cache] Помилка запису кешу ${key}:`, error.message);
    }

    return data;
  }

  /**
   * Видалити значення з кешу
   */
  static delete(key) {
    memoryCache.delete(key);

    const filePath = this._getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Cache] Видалено: ${key}`);
      } catch (error) {
        console.error(`[Cache] Помилка видалення ${key}:`, error.message);
      }
    }
  }

  /**
   * Очистити весь кеш
   */
  static clear() {
    memoryCache.clear();
    
    try {
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      });
      console.log(`[Cache] Кеш очищений`);
    } catch (error) {
      console.error(`[Cache] Помилка очищення:`, error.message);
    }
  }

  /**
   * Отримати статистику кешу
   */
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

  // ===== ПРИВАТНІ МЕТОДИ =====

  static _isExpired(cacheEntry) {
    const now = Date.now();
    const age = now - cacheEntry.timestamp;
    return age > cacheEntry.ttl;
  }

  static _getCacheFilePath(key) {
    // Замінити символи, небезпечні для імені файлу
    const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(CACHE_DIR, `${safeKey}.json`);
  }
}

module.exports = CacheService;
