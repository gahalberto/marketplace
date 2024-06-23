const User = require('../models/User');

module.exports = {
    // Middleware to check for user authentication
    private: async (req, res, next) => {
        try {
            const token = req.query.token || req.body.token || '';

            // If token is empty, return not allowed
            if (token === '') {
                return res.status(401).json({ notallowed: true });
            }

            // Find user by token
            const user = await User.findOne({ token });

            // If user is not found, return not allowed
            if (!user) {
                return res.status(401).json({ notallowed: true });
            }

            // If everything is fine, proceed to the next middleware or route handler
            next();
        } catch (error) {
            res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }
}
