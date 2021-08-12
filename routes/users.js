const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }

      try {
        const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
        return res.status(200).json('Account has been updated');
      } catch (error) {
        return res.status(500).json('Error finding the user');
      }
    }
    else {
      return res.status(400).json('Please include your password');
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});
// delete user
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
      try {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json('Account has been deleted successfully');
      } catch (error) {
        return res.status(500).json('Error deleting the user');
      }
    }
    else {
      return res.status(400).json('Please include your password');
    }
  } else {
    return res.status(403).json("You can only delete your account!");
  }
});
// get user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// follow user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        return res.status(200).json('User has been followed');
      } else {
        return res.status(403).json('You already follow this user');
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json('You cannot follow yourself');
  }
});
// unfollow user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        return res.status(200).json('User has been unfollowed');
      } else {
        return res.status(403).json('You do not follow user');
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json('You cannot unfollow yourself');
  }
});


module.exports = router;