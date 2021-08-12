const app = require('../index');
const mongoose = require('mongoose');
const supertest = require('supertest');
require('dotenv').config();
// const User = require('../models/User');

// Connect to Mongo DB before running the tests
beforeAll((done) => {
  mongoose.connect(process.env.MONGO_TEST_URL, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
    useFindAndModify: true,
  }, () => {
    try {
      console.log('Mongo DB connected');
      return done();
    } catch (error) {
      console.log(error);
    }
  });
});

describe('Auth Endpoints', () => {
  it('should create a new user', async () => {
    const res = await supertest(app).post('/api/auth/register').send({
      username: 'john',
      email: "john@gmail.com",
      password: "123456"
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('password');
    expect(res.body).toHaveProperty('email');
  });
  it('should not create a new user', async () => {
    const res = await supertest(app).post('/api/auth/register').send({
      username: 'john',
      email: "john@gmail.com",
      password: "123456"
    });
    expect(res.statusCode).toEqual(500);
  });
  it('should login a user', async () => {
    const res = await supertest(app).post('/api/auth/login').send({
      username: 'john',
      email: "john@gmail.com",
      password: "123456"
    });
    expect(res.statusCode).toEqual(200);
  });
  it('should not login a user - user not exist', async () => {
    const res = await supertest(app).post('/api/auth/login').send({
      email: "jane@gmail.com",
      password: "123456"
    });
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual("User not found");
  });
  it('should not login a user -  wrong password', async () => {
    const res = await supertest(app).post('/api/auth/login').send({
      email: "john@gmail.com",
      password: "12356"
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual("Wrong password!");
  });
});

// A function to drop all the collections in the db
async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // This error happens when you try to drop a collection that's already dropped. Happens infrequently. 
      // Safe to ignore. 
      if (error.message === 'ns not found') return;

      // This error happens when you use it.todo.
      // Safe to ignore. 
      if (error.message.includes('a background operation is currently running')) return;

      console.log(error.message);
    }
  }
}

afterAll(async () => {
  // drop all the collections in the db
  await dropAllCollections();
  // Closes the Mongoose connection
  await mongoose.connection.close();
});