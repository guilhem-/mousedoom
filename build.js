const fs = require('fs');
const { minify } = require('terser');
const { minify: minifyHtml } = require('html-minifier-terser');

async function build() {
  const template = fs.readFileSync('src/index.html', 'utf8');
  const client = fs.readFileSync('client.js', 'utf8');
  const minClient = await minify(client);
  let html = template.replace('<!--SCRIPT-->', `<script>${minClient.code}</script>`);
  html = await minifyHtml(html, {
    collapseWhitespace: true,
    removeComments: true
  });
  fs.writeFileSync('index.html', html);
}

build().catch(err => { console.error(err); process.exit(1); });
