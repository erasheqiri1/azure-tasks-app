// require('dotenv').config();

// const express = require('express');
// const morgan = require('morgan');
// const helmet = require('helmet');
// const cors = require('cors');
// const compression = require('compression');
// const rateLimit = require('express-rate-limit');
// const path = require('path');

// const indexRouter = require('./routes/index');
// const apiRouter = require('./routes/api');
// const { requestLogger } = require('./middleware/logger');
// const { errorHandler, notFound } = require('./middleware/errorHandler');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Security & performance middleware
// app.use(helmet({ contentSecurityPolicy: false }));
// app.use(cors());
// app.use(compression());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);

// // Logging
// app.use(morgan('combined'));
// app.use(requestLogger);

// // Body parsing
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Routes
// app.use('/', indexRouter);
// app.use('/api', apiRouter);

// // 404 & error handlers
// app.use(notFound);
// app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`App: http://localhost:${PORT}`);
// });

// module.exports = app;


// //per bot
// const restify = require('restify');

// const {
//     BotFrameworkAdapter,
//     ActivityHandler
// } = require('botbuilder');

// const botServer = restify.createServer();

// botServer.listen(process.env.PORT || 3978, () => {
//     console.log("Azure Bot Started");
// });

// const adapter = new BotFrameworkAdapter({
//     appId: process.env.MicrosoftAppId,
//     appPassword: process.env.MicrosoftAppPassword
// });

// class TaskBot extends ActivityHandler {

//     constructor() {
//         super();

//         this.onMessage(async (context, next) => {

//             const text = context.activity.text.toLowerCase();

//             let reply = "Unknown command";

//             if (text.includes("hello")) {
//                 reply = "Hello from TaskFlow Bot!";
//             }

//             else if (text.includes("help")) {
//                 reply = "Available commands: hello, help, tasks";
//             }

//             else if (text.includes("tasks")) {
//                 reply = "You can manage tasks from the dashboard.";
//             }

//             await context.sendActivity(reply);

//             await next();
//         });
//     }
// }

// const bot = new TaskBot();

// botServer.post('/api/messages', (req, res) => {

//     adapter.processActivity(req, res, async (context) => {

//         await bot.run(context);

//     });

// });
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const {
  BotFrameworkAdapter,
  ActivityHandler
} = require('botbuilder');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const { requestLogger } = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & performance middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route
app.use('/', indexRouter);

// ==========================
// AZURE BOT CONFIGURATION
// ==========================

// Empty config is used because the bot was created with User-Assigned Managed Identity.
// This avoids MicrosoftAppPassword issues.
const adapter = new BotFrameworkAdapter({});

adapter.onTurnError = async (context, error) => {
  console.error('[Bot Error]', error);
  await context.sendActivity('Bot error: something went wrong.');
};

class TaskBot extends ActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      const text = (context.activity.text || '').toLowerCase();

      let reply = 'Unknown command. Type "help" to see available commands.';

      if (text.includes('hello') || text.includes('hi')) {
        reply = 'Hello from TaskFlow Bot!';
      } else if (text.includes('help')) {
        reply = 'Available commands: hello, help, tasks, completed.';
      } else if (text.includes('tasks')) {
        reply = 'You can manage tasks from the dashboard.';
      } else if (text.includes('completed')) {
        reply = 'Completed tasks are visible in the dashboard statistics.';
      }

      await context.sendActivity(reply);
      await next();
    });
  }
}

const bot = new TaskBot();

// IMPORTANT: This route must be BEFORE app.use('/api', apiRouter)
app.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});

// API routes
app.use('/api', apiRouter);

// 404 & error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`App: http://localhost:${PORT}`);
  console.log('Azure Bot endpoint: /api/messages');
});

module.exports = app;