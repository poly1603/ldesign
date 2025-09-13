const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath;
  
  if (req.url === '/') {
    filePath = path.join(__dirname, 'example', 'advanced-features.html');
  } else {
    filePath = path.join(__dirname, req.url);
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';
  else if (extname === '.json') contentType = 'application/json';
  else if (extname === '.map') contentType = 'application/json';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found: ' + req.url);
      } else {
        res.writeHead(500);
        res.end('Server error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf8');
    }
  });
});

server.listen(8083, () => {
  console.log('Server running at http://localhost:8083');
  console.log('Serving files from:', __dirname);
});
