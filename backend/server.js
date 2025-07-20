const dotenv = require('dotenv');

const connectDB = require('./config/db/connectDB');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});

const app = require('./app');

connectDB();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Serveur à l'écoute du port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
