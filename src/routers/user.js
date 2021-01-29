const express = require('express');
const User = require('../db/models/User');
const updateIsAllowed = require('../utils/allowedUpdates');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = express.Router();

// Sing up
router.post('/users', async (req ,res) => {
    const user = new User(req.body);
    try {
        // await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({
            user,
            token,
        });
    } catch (error) {
        res.status(400).send({error: error.message});
    }
});

// Log in
router.post('/users/login',  async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.send({
            user,
            token,
        });
    } catch (error) {
        res.status(400).send({error: error.message});
    }
});

// Log out
router.post('/users/logout', authMiddleware, async (req, res) => {
    // req.user, req.token from auth middleware
    try {
        const {user, token} = req;
        user.tokens = user.tokens.filter((tokenItem) => tokenItem.token !== token);
        await user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Log out all tokens
router.post('/users/logoutAll', authMiddleware, async (req, res) => {
   try {
       const {user} = req;
       user.tokens = [];
       await user.save();
       res.send();
   } catch (_) {
       res.status(500).send();
   }
});

// Get user
router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user); // req.user from auth middleware
});

// Update user
router.patch('/users/me', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    if (!updateIsAllowed(updates, allowedUpdates)) {
        return res.status(400).send({error: 'Update is invalid'});
    }

    try {
        const {user} = req;
        updates.forEach((item) => user[item] = req.body[item])
        await user.save();

        res.send(user)
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete user
router.delete('/users/me', authMiddleware, async (req, res) => {
    try {
        const {user} = req;
        await user.remove();
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

const uploadAvatar = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new Error('wrong file extension'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 150, height: 150 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save()
    res.send();
}, (error, req, res, next) => {
    console.log(error);
    res.status(400).send({error: error.message});
});

router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send()
    } catch (_) {
        res.status(400).send();
    }
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user  = await User.findById(req.params.id);

        if (!user && !user.avatar) {
            throw new Error('No avatar');
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send({error: error.message});
    }
})

module.exports = router;

