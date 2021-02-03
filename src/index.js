const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const port = process.env.PORT;

const app = express();
app.use(express.json());

const routes = [userRouter, taskRouter];
routes.forEach((route) => app.use(route));

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});