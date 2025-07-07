const fs = require('fs');
const assert = require('assert');
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('<h1>Mouse mermory doom</h1>'));
assert(html.includes('<span id="counter"></span>'));
console.log('Client test passed');
