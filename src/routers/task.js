const express = require('express');
const Task = require('../db/models/Task');
const authMiddleware = require('../middleware/auth');
const updateIsAllowed = require('../utils/allowedUpdates');

const router = express.Router();

// Create task
router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update task
router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    if (!updateIsAllowed(updates, allowedUpdates)) {
        return res.status(400).send({error: 'Update is invalid'});
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((item) => task[item] = req.body[item]);
        await task.save();

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get task
router.get('/tasks', authMiddleware, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const [sortParam, sortValue] = req.query.sortBy && req.query.sortBy.split(':') || [];
        sort[sortParam] = sortValue === 'desc' ? -1 : 1;
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id, completed: match.completed });
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get task buy Id
router.get('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete task
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;