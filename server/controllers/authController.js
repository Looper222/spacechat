const User = require('../models/User');
const jwt = require('jsonwebtoken');

// handling errrors
const handleErrorsLogin = (err) => {
    console.log(err.message, err.code);
    let errors = { login: '', password: ''};

    // incorrect login
    if (err.message === 'incorrect login') {
        errors.login = 'That login is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'Entered password is not correct';
    }

    return errors;
};

const handleErrorsSignup = (err) => {
    console.log(err.message, err.code);
    // let errors = {
    //     fname: '',
    //     surname: '',
    //     password: '',
    //     phoneNumber: '',
    //     birthDate: '',
    //     gender: ''
    // }

    let errors = {
        login: '',
        password: ''
    };

    // duplicate value errors
    if (err.code === 11000) {
        if (err.message.includes('login_1 dup')) {
            errors.login = 'That login is already registered';
            return errors;
        }
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

const maxAge = 1 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'jNTT1iPgSTGGnmah', { expiresIn: maxAge });
};


const signup_post = async (req, res) => {
    const { login, password } = req.body;
    // const { fname, surname, password, phoneNumber, birthDate, gender } = req.body;
    // const onlineStatus = false;
    // const friends = [];
    // const notifs = [];
    // const chat = [];
    // const lastContacts = [];

    try {
        const user = await User.create({ login, password });

        const token = createToken(user._id);

        res.cookie('authenticatedUser', token, { maxAge: maxAge * 1000, httpOnly: true, sameSite: 'lax' });
        res.status(201).json({ user: user._id });
    }
    catch(err) {
        const errors = handleErrorsSignup(err);
        res.status(400).json({ errors });
    }
};


const login_post = async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await User.login( login, password);
        const token = createToken(user._id);
        res.cookie('authenticatedUser', token, { maxAge: maxAge * 1000, httpOnly: true, sameSite: 'lax' });
        res.status(200).json({ id: user._id, login: user.login, token: token });
    }
    catch(err) {
        const errors = handleErrorsLogin(err);
        res.status(400).json({ errors });
    }
};


module.exports = {
    signup_post,
    login_post
};