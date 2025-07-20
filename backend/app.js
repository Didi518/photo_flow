const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/appError');
const corsOptions = require('./config/cors/corsOptions');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');

const app = express();

app.use('/', express.static('uploads'));
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);

app.all('*', (req, _res, next) => {
  const safeUrl = encodeURI(req.originalUrl);
  next(new AppError(`La route ${safeUrl} n'existe pas sur ce serveur!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
