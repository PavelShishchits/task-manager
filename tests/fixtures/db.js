const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/db/models/User');
const Task = require('../../src/db/models/Task');

const generateUser = (data) => {
    const userId = new mongoose.Types.ObjectId();

    return {
        _id: userId,
        tokens: [{
            token: jwt.sign({_id: userId}, process.env.JWT_SECRET),
        }],
        ...data,
    }
}

const generateTask = (data) => {
    return {
        _id: new mongoose.Types.ObjectId(),
        ...data,
        completed: Boolean(data.completed),
    }
}

const userOne = generateUser({ name: 'Varya', email: 'varya@example.com', password: 'mew123mew'});
const userTwo = generateUser({ name: 'Pavel', email: 'pavel@example.com', password: 'pavel123231'});

const taskOne = generateTask({ completed: false, owner: userOne._id, description: 'Task one' });
const taskTwo = generateTask({ completed: true, owner: userOne._id, description: 'Task two' });

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
}

module.exports = {
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    setupDatabase,
}