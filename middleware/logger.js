const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: ${duration}ms,
      ip: req.ip || req.connection.remoteAddress
    };
    const line = JSON.stringify(logEntry) + '\n';
    fs.appendFile(path.join(logDir, 'access.log'), line, () => {});
  });
  next();
}

module.exports = { requestLogger };