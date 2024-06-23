const { validationResult, matchedData } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const State = require('../models/State');

module.exports = {
    // Sign in a user
    signin: async (req, res) => {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ error: errors.mapped() });
        }

        const data = matchedData(req);

        // Check if user exists
        const user = await User.findOne({ email: data.email });
        if (!user) return res.json({ error: 'E-mail or password is incorrect' });

        // Compare passwords
        const match = await bcrypt.compare(data.password, user.passwordHash);
        if (!match) return res.json({ error: 'E-mail or password is incorrect' });

        // Generate token
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        user.token = token;
        await user.save();

        res.json({ token, email: data.email });
    },

    // Sign up a new user
    signup: async (req, res) => {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ error: errors.mapped() });
        }

        const data = matchedData(req);

        // Check if email is already in use
        const user = await User.findOne({ email: data.email });
        if (user) {
            return res.json({
                error: { email: { msg: 'E-mail already exists' } }
            });
        }

        // Check if state ID is valid
        if (mongoose.Types.ObjectId.isValid(data.state)) {
            const stateItem = await State.findById(data.state);
            if (!stateItem) {
                return res.json({ error: { state: 'State does not exist' } });
            }
        } else {
            return res.json({ error: { state: 'Invalid state code' } });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Generate token
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        // Create new user
        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash,
            token,
            state: data.state
        });

        await newUser.save();

        res.json({ token });
    }
}
