const http = require('http');
const assert = require('assert');
const server = require('../server');

const PORT = 3100;
server.listen(PORT, () => {
  const postData = JSON.stringify({ records: [{ x: 0, y: 0, t: 0 }] });
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/records',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(body);
      assert(Array.isArray(data.records));
      console.log('Server test passed');
      server.close();
    });
  });
  req.on('error', err => { console.error(err); server.close(); process.exit(1); });
  req.write(postData);
  req.end();
});
