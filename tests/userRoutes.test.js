const app = require('../index');
const mongoose = require('mongoose');
const supertest = require('supertest');
require('dotenv').config();
const Post = require('../models/Post');
const User = require('../models/User');

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

describe('Users Endpoints', () => {
  it('should edit user details', async () => {
    const user = await User.create({
      username: 'john',
      email: "john@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).put(`/api/users/${user._id}`).send({
      username: 'joa',
      password: "123456",
      userId: user._id
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('Account has been updated');
  });
  it('should not edit user details - wrong user id', async () => {
    const user = await User.create({
      username: 'job',
      email: "job@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).put(`/api/users/adada`).send({
      username: 'joc',
      password: "123456",
      userId: 'adada'
    });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual('Error finding the user');
  });
  it('should not edit user details - no password', async () => {
    const user = await User.create({
      username: 'jod',
      email: "jod@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).put(`/api/users/${user._id}`).send({
      username: 'joe',
      userId: user._id
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual('Please include your password');
  });
  it('should not edit user details - no user id and not admin', async () => {
    const user = await User.create({
      username: 'jof',
      email: "jof@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).put(`/api/users/${user._id}`).send({
      username: 'jog',
      passowrd: '123456'
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual("You can update only your account!");
  });

  it('should delete user', async () => {
    const user = await User.create({
      username: 'joh',
      email: "joh@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).delete(`/api/users/${user._id}`).send({
      password: "123456",
      userId: user._id
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('Account has been deleted successfully');
  });
  it('should not delete user - wrong user id', async () => {
    const user = await User.create({
      username: 'joi',
      email: "joi@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).delete(`/api/users/adada`).send({
      password: "123456",
      userId: 'adada'
    });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual('Error deleting the user');
  });
  it('should not delete user - no password', async () => {
    const user = await User.create({
      username: 'joj',
      email: "joj@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).delete(`/api/users/${user._id}`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual('Please include your password');
  });
  it('should not delete user - no user id and not admin', async () => {
    const user = await User.create({
      username: 'jok',
      email: "jok@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).delete(`/api/users/${user._id}`).send({
      passowrd: '123456'
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual("You can only delete your account!");
  });

  it('should get a user', async () => {
    const user = await User.create({
      username: 'jol',
      email: 'jol@gmail.com',
      password: '123456'
    });

    const res = await supertest(app).get(`/api/users/${user._id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
  });
  it('should not get a user - server error', async () => {
    const user = User.create({
      username: 'jom',
      email: 'jom@gmail.com',
      password: '123456'
    });

    const res = await supertest(app).get(`/api/users/${user._id}`);
    expect(res.statusCode).toEqual(500);
  });
  it('should follow a user', async () => {
    const user = await User.create({
      username: 'jon',
      email: "jon@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'joo',
      email: "joo@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('User has been followed');
  });
  it('should not follow a user -  already followed', async () => {
    const user = await User.create({
      username: 'jop',
      email: "jop@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'joq',
      email: "joq@gmail.com",
      password: "123456"
    });

    await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: user._id
    });
    const res = await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual('You already follow this user');
  });
  it('should not follow a user -  server error', async () => {
    const user = await User.create({
      username: 'jor',
      email: "jor@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'jos',
      email: "jos@gmail.com",
      password: "123456"
    });
    const res = await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: 'adada'
    });
    expect(res.statusCode).toEqual(500);
  });
  it('should not follow a user -  same user id', async () => {
    const user = await User.create({
      username: 'jot',
      email: "jot@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'jou',
      email: "jou@gmail.com",
      password: "123456"
    });
    const res = await supertest(app).put(`/api/users/${user._id}/follow`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual('You cannot follow yourself');
  });

  it('should unfollow a user', async () => {
    const user = await User.create({
      username: 'jov',
      email: "jov@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'jow',
      email: "jow@gmail.com",
      password: "123456"
    });
    await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: user._id
    });
    const res = await supertest(app).put(`/api/users/${user2._id}/unfollow`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('User has been unfollowed');
  });
  it('should not unfollow a user -  already unfollowed/not following', async () => {
    const user = await User.create({
      username: 'jox',
      email: "jox@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'joy',
      email: "joy@gmail.com",
      password: "123456"
    });

    const res = await supertest(app).put(`/api/users/${user2._id}/unfollow`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual('You do not follow user');
  });
  it('should not unfollow a user -  server error', async () => {
    const user = await User.create({
      username: 'joz',
      email: "joz@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'joaa',
      email: "joaa@gmail.com",
      password: "123456"
    });
    await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: user._id
    });
    const res = await supertest(app).put(`/api/users/${user2._id}/unfollow`).send({
      userId: 'adada'
    });
    expect(res.statusCode).toEqual(500);
  });
  it('should not unfollow a user -  same user id', async () => {
    const user = await User.create({
      username: 'joab',
      email: "joab@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'joac',
      email: "joac@gmail.com",
      password: "123456"
    });
    await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: user._id
    });
    const res = await supertest(app).put(`/api/users/${user._id}/unfollow`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual('You cannot unfollow yourself');
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