const { model, Schema } = require('mongoose');
const { hash, compare } = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        },
        required: [true, 'Email field is required'],
    },
    password: {
        type: String,
        required: [true, 'Password field is required'],
        minLength: [6, 'Password should contain at least 6 chars'],
        trim: true,
        validate: {
            validator(value) {
                return !value.toLowerCase().includes('password');
            },
            message(props) {
                return `${props.value} is unacceptable password value`;
            }
        }
    },
    age: {
        type: Number,
        min: 0,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true,
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {
        expiresIn: '7 days',
    });
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

// Hash password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await hash(user.password, 8);
    }
    next();
});

userSchema.pre('remove', async function (next) {
   const user = this;
   await Task.deleteMany({owner: user._id});
   next()
});

const User = model('User', userSchema);

module.exports = User;