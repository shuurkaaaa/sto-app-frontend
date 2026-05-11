#!/usr/bin/env node

/**
 * Тестовий скрипт для перевірки VIN скрапера
 * Запуск: node test-scraper.js
 */

const { scrapeVINHistory } = require('./services/vinScraper');

// Тестові VIN-коди
const testVINs = [
  'WBAEB53442VJ88386', // BMW 2002 (Європа)
  '2HGCV51667H004352', // Honda 2007 (США/Японія)
  'LFVNCLF30LP078915', // Lexus 2020 (Японія)
  'KMHLN4AJ1EU546837', // Hyundai (Південна Корея)
  'VFBVK0070AE000001', // Peugeot (Франція)
];

async function runTests() {
  console.log('🚀 Запуск тестів VIN скрапера...\n');

  for (const vin of testVINs) {
    try {
      console.log(`⏳ Тестування VIN: ${vin}`);
      const result = await scrapeVINHistory(vin);
      
      console.log(`✅ Результат для ${vin}:`);
      console.log(`   - autoRIA: ${result.sources.autoRIA.found ? '✓ знайдено' : '✗ не знайдено'}`);
      console.log(`   - ДТП: ${result.sources.accidents.accidents?.length || 0} записів`);
      console.log(`   - Сервіс: ${result.sources.services.recommendations?.length || 0} рекомендацій`);
      console.log(`   - Відгуки: ${result.sources.reviews.searchLinks?.length || 0} посилань`);
      console.log(`\n   📝 Дані:\n${result.summary}`);
      console.log('\n' + '='.repeat(70) + '\n');
      
    } catch (error) {
      console.error(`❌ Помилка для ${vin}: ${error.message}\n`);
    }
  }

  console.log('✨ Всі тести завершені!');
}

runTests().catch(error => {
  console.error('🔴 Критична помилка:', error);
  process.exit(1);
});
