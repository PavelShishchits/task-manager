const express = require('express');
const User = require('../db/models/User');
const updateIsAllowed = require('../utils/allowedUpdates');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/users', async (req ,res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({
            user,
            token,
        });
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
});

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
        res.status(400).send(error);
    }
});

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    if (!updateIsAllowed(updates, allowedUpdates)) {
        return res.status(400).send({error: 'Update is invalid'});
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return req.status(404).send();
        }

        updates.forEach((item) => user[item] = req.body[item])
        await user.save();

        res.send(user)
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user); // req.user from auth middleware
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

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

