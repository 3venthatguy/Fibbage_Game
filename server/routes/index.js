/**
 * Express route handlers.
 */

const path = require('path');

/**
 * Sets up Express routes.
 * @param {object} app - Express app instance
 */
function setupRoutes(app) {
  // Serve static files from public directory
  app.use(require('express').static(path.join(__dirname, '../../public')));

  // Root route serves host screen
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/host.html'));
  });
}

module.exports = {
  setupRoutes
};
