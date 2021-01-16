const mongoose = require('mongoose');

const TaskSchema = mongoose.model('Task', {
    description: {
        type: String,
        trim: true,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
});

module.exports = TaskSchema;