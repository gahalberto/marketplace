const { validationResult, matchedData } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const State = require('../models/State');
const User = require('../models/User');
const Category = require('../models/Category');
const Ad = require('../models/Ad');

module.exports = {
    // Get list of states
    getStates: async (req, res) => {
        try {
            let states = await State.find();
            res.json({ states });
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: error.message });
            }
        }
    },

    // Get user info
    info: async (req, res) => {
        let { token } = req.query;
        try {
            const user = await User.findOne({ token });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const state = await State.findById(user.state);
            if (!state) {
                return res.status(404).json({ error: 'State not found' });
            }

            const ads = await Ad.find({ idUser: user._id.toString() });

            let adList = [];
            for (let i in ads) {
                const cat = await Category.findById(ads[i].category);
                adList.push({ ...ads[i]._doc, category: cat.slug });
            }

            res.json({
                name: user.name,
                email: user.email,
                state: state.name,
                ads: adList
            });
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: error.message });
            }
        }
    },

    // Edit user information
    editAction: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ error: errors.mapped() });
        }

        const data = matchedData(req);

        let updates = {};

        if (data.name) updates.name = data.name;
        if (data.email) {
            const emailCheck = await User.findOne({ email: data.email });
            if (emailCheck) {
                return res.json({ error: "Email already exists" });
            }
            updates.email = data.email;
        }

        if (data.state) {
            if (mongoose.Types.ObjectId.isValid(data.state)) {
                const stateCheck = await State.findById(data.state);
                if (!stateCheck) {
                    return res.json({ error: "State does not exist" });
                }
                updates.state = data.state;
            } else {
                return res.json({ error: "Invalid state code" });
            }
        }

        if (data.password) {
            updates.passwordHash = await bcrypt.hash(data.password, 10);
        }

        await User.findOneAndUpdate({ token: data.token }, { $set: updates });

        return res.json({ success: true });
    }
}
