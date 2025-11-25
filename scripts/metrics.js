const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '../playwright-report/results.json');

if (!fs.existsSync(reportPath)) {
  console.log('❌ No test results found. Run: npm run test:playwright');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

console.log('\n📊 PLAYWRIGHT TEST METRICS\n');
console.log('═══════════════════════════════════════════════════\n');

// Overall stats
const stats = results.stats;
console.log('📈 Overall Statistics:');
console.log(`   Total Tests: ${stats.expected}`);
console.log(`   ✅ Passed: ${stats.expected - stats.unexpected - stats.flaky}`);
console.log(`   ❌ Failed: ${stats.unexpected}`);
console.log(`   ⚠️  Flaky: ${stats.flaky}`);
console.log(`   ⏭️  Skipped: ${stats.skipped}`);

// Duration
const duration = ((stats.duration) / 1000).toFixed(2);
console.log(`   ⏱️  Total Duration: ${duration}s\n`);

// Suites breakdown
console.log('📋 Tests by Suite:\n');
results.suites.forEach(suite => {
  const suiteName = suite.title || 'Root';
  const tests = suite.tests || [];
  
  if (tests.length > 0) {
    const passed = tests.filter(t => t.status === 'expected').length;
    const failed = tests.filter(t => t.status === 'unexpected').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;
    
    console.log(`   📂 ${suiteName}`);
    console.log(`      Tests: ${tests.length} | ✅ ${passed} | ❌ ${failed} | ⏭️ ${skipped}`);
    
    tests.forEach(test => {
      const icon = test.status === 'expected' ? '✅' : test.status === 'skipped' ? '⏭️' : '❌';
      const duration = test.duration ? `${(test.duration / 1000).toFixed(2)}s` : 'N/A';
      console.log(`      ${icon} ${test.title} (${duration})`);
    });
    console.log('');
  }
});

// Browser breakdown
console.log('🌐 Browser Results:\n');
const browsers = {};
results.suites.forEach(suite => {
  const tests = suite.tests || [];
  tests.forEach(test => {
    test.results?.forEach(result => {
      const browser = result.workerIndex === 0 ? 'Chromium' : result.workerIndex === 1 ? 'Firefox' : 'Unknown';
      if (!browsers[browser]) {
        browsers[browser] = { passed: 0, failed: 0, duration: 0 };
      }
      if (test.status === 'expected') browsers[browser].passed++;
      if (test.status === 'unexpected') browsers[browser].failed++;
      browsers[browser].duration += test.duration || 0;
    });
  });
});

Object.entries(browsers).forEach(([browser, data]) => {
  const total = data.passed + data.failed;
  console.log(`   ${browser}: ${data.passed}/${total} passed`);
});

console.log('\n═══════════════════════════════════════════════════\n');
console.log('💡 View full report: npm run test:playwright:report\n');
