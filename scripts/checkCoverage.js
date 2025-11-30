const fs = require('fs');
const path = require('path');

const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
  console.error('❌ Coverage summary not found. Run tests with coverage first.');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
const total = coverage.total;

console.log('\n📊 Coverage Report:\n');
console.log(`Lines:       ${total.lines.pct}%`);
console.log(`Statements:  ${total.statements.pct}%`);
console.log(`Functions:   ${total.functions.pct}%`);
console.log(`Branches:    ${total.branches.pct}%\n`);

const threshold = 70;
let hasIssues = false;

if (total.lines.pct < threshold) {
  console.error(`❌ Lines coverage ${total.lines.pct}% below ${threshold}% threshold!`);
  hasIssues = true;
}
if (total.statements.pct < threshold) {
  console.error(`❌ Statements coverage ${total.statements.pct}% below ${threshold}% threshold!`);
  hasIssues = true;
}
if (total.functions.pct < threshold) {
  console.error(`❌ Functions coverage ${total.functions.pct}% below ${threshold}% threshold!`);
  hasIssues = true;
}
if (total.branches.pct < threshold) {
  console.error(`❌ Branches coverage ${total.branches.pct}% below ${threshold}% threshold!`);
  hasIssues = true;
}

if (!hasIssues) {
  console.log('✅ Coverage threshold met!\n');
  process.exit(0);
} else {
  process.exit(1);
}

