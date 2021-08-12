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

describe('Posts Endpoints', () => {
  it('should create a new post', async () => {
    await User.create({
      username: 'john',
      email: "john@gmail.com",
      password: "123456"
    }).then(data =>
      data.json()
    ).then(async (user) => {
      await supertest(app).post('/api/posts/').send({
        desc: 'This is the first description here',
        userId: user._id
      }).then(data => data.json()
      ).then(res => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('desc');
        expect(res.body).toHaveProperty('likes');
      });
    }).catch(error => {
      return new Error("Something bad happened!", error);
    });
  });

  it('should update a post', async () => {
    const user = await User.create({
      username: 'jane',
      email: "jane@gmail.com",
      password: "123456"
    });
    const post = await Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).put(`/api/posts/${post._id}`).send({
      desc: 'This is the modified description here',
      userId: user._id
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('Post updated successfully');
  });

  it('should not update a post - not same user id', async () => {
    const user = await User.create({
      username: 'joe',
      email: "joe@gmail.com",
      password: "123456"
    });
    const post = await Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).put(`/api/posts/${post._id}`).send({
      desc: 'This is the modified description here',
      userId: "aada"
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual('You can only update your posts');
  });

  it('should not update a post - server error', async () => {
    const user = await User.create({
      username: 'jay',
      email: "jay@gmail.com",
      password: "123456"
    });
    const post = Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).put(`/api/posts/${post._id}`).send({
      desc: 'This is the modified description here',
      userId: "aada"
    });
    expect(res.statusCode).toEqual(500);
  });

  it('should delete a post', async () => {
    const user = await User.create({
      username: 'jade',
      email: "jade@gmail.com",
      password: "123456"
    });
    const post = Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).delete(`/api/posts/${post._id}`).send({
      userId: user._id,
    });
    expect(res.statusCode).toEqual(500);
  });
  it('should not delete a post - not same user id', async () => {
    const user = await User.create({
      username: 'jab',
      email: "jab@gmail.com",
      password: "123456"
    });
    const post = await Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).delete(`/api/posts/${post._id}`).send({
      userId: "aada"
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual('You can only delete your posts');
  });
  it('should not delete a post - server error', async () => {
    const user = await User.create({
      username: 'jad',
      email: "jad@gmail.com",
      password: "123456"
    });
    const post = Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).delete(`/api/posts/${post._id}`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(500);
  });
  it('should like and dislike a post', async () => {
    const user = await User.create({
      username: 'jae',
      email: "jae@gmail.com",
      password: "123456"
    });
    const post = await Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const like = await supertest(app).put(`/api/posts/${post._id}/like`).send({
      userId: user._id
    });
    expect(like.statusCode).toEqual(200);
    expect(like.body).toEqual('The post has been liked');
    const dislike = await supertest(app).put(`/api/posts/${post._id}/like`).send({
      userId: user._id
    });
    expect(dislike.statusCode).toEqual(200);
    expect(dislike.body).toEqual('The post has been disliked');
  });

  it('should not like and dislike a post -  server error', async () => {
    const user = await User.create({
      username: 'jaf',
      email: "jaf@gmail.com",
      password: "123456"
    });
    const post = Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const like = await supertest(app).put(`/api/posts/${post._id}/like`).send({
      userId: user._id
    });
    expect(like.statusCode).toEqual(500);
    const dislike = await supertest(app).put(`/api/posts/${post._id}/like`).send({
      userId: user._id
    });
    expect(dislike.statusCode).toEqual(500);
  });
  it('should get a post', async () => {
    const user = await User.create({
      username: 'jag',
      email: "jag@gmail.com",
      password: "123456"
    });
    const post = await Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).get(`/api/posts/${post._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('desc');
    expect(res.body).toHaveProperty('likes');
  });

  it('should not get a post - server error', async () => {
    const user = await User.create({
      username: 'jaz',
      email: "jaz@gmail.com",
      password: "123456"
    });
    const post = Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const res = await supertest(app).get(`/api/posts/${post._id}`);
    expect(res.statusCode).toEqual(500);
  });
  it('should get a user\s timeline', async () => {
    const user = await User.create({
      username: 'jah',
      email: "jah@gmail.com",
      password: "123456"
    });
    const user2 = await User.create({
      username: 'jam',
      email: "jam@gmail.com",
      password: "123456"
    });
    const post = await Post.create({
      desc: 'This is the first description here',
      userId: user._id
    });
    const post2 = await Post.create({
      desc: 'This is the first description here',
      userId: user2._id
    });
    await supertest(app).put(`/api/users/${user2._id}/follow`).send({
      userId: user._id
    });
    const res = await supertest(app).get(`/api/posts/timeline/all`).send({
      userId: user._id
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
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