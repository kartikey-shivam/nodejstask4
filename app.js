const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const user = require('./routes/userRoute');
const globalErrorHandler = require('./controller/errorController');

app.use(express.json());
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1', user);

app.use(globalErrorHandler);

module.exports = app;
