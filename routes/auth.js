const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');

// register
router.post('/register', async (req, res) => {
  try {
    // generate new passowrd
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    // save user and return response
    const user = await newUser.save();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json('User not found');
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json('Wrong password!');
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});



module.exports = router;