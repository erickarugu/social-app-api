const morgan = require('morgan');
require('dotenv').config();
const helmet = require('helmet');
const mongoose = require('mongoose');
const express = require('express');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');

const app = express();
if (process.env.NODE_ENV == "development") {
  console.log('Server Running in dev mode');
  mongoose.connect(process.env.MONGO_DEV_URL, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
    useFindAndModify: true,
  }, () => {
    try {
      console.log('Mongo DB connected');
    } catch (error) {
      console.log(error);
    }
  });
} else if (process.env.NODE_ENV == "production") {
  console.log('Running in production mode');
  mongoose.connect(process.env.MONGO_PROD_URL, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
    useFindAndModify: true,
  }, () => {
    try {
      console.log('Mongo DB connected');
    } catch (error) {
      console.log(error);
    }
  });
} else {
  console.log('Hey we are in testing mode');
}
// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

module.exports = app;
