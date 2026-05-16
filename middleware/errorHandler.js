function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  console.error(`[ERROR] ${err.message}`, err.stack);
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
}

module.exports = { notFound, errorHandler };
