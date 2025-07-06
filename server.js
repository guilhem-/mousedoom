const http = require('http');
const fs = require('fs');
const path = require('path');

let records = [];

function sendFile(res, filePath, contentType) {
  console.log('[GET]', filePath);
  fs.readFile(path.join(__dirname, filePath), (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  if (req.method === 'GET') {
    if (req.url === '/client.js') {
      return sendFile(res, 'client.js', 'application/javascript');
    }
    if (req.url === '/vue.js') {
      return sendFile(res, 'vue.js', 'application/javascript');
    }
    if (req.url === '/records') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ records }));
    }
    return sendFile(res, 'index.html', 'text/html');
  }

  if (req.method === 'POST' && req.url === '/records') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (Array.isArray(data.records)) {
          console.log('[POST] received', data.records.length, 'points');
          records.push(data.records);
          if (records.length > 50) records.shift();
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ records }));
      } catch (e) {
        res.writeHead(400);
        res.end('Bad request');
      }
    });
    return;
  }

  if (req.method === 'DELETE' && req.url === '/records') {
    records = [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ records }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log('Server listening on ' + PORT));
}

module.exports = server;
