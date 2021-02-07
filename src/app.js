const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
app.use(express.json());

const routes = [userRouter, taskRouter];
routes.forEach((route) => app.use(route));

module.exports = app;