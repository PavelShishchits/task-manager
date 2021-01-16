const mongoose = require('mongoose');

const connectionUrl = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager-api';

mongoose.connect(`${connectionUrl}/${databaseName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})