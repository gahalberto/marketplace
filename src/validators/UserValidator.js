const { checkSchema } = require('express-validator');

module.exports = {
    // Schema validation for editing user information
    editAction: checkSchema({
        token: {
            notEmpty: true,
            errorMessage: 'Token is required'
        },
        name: {
            optional: true,
            trim: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Name must be at least 2 characters long'
        },
        email: {
            optional: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'Invalid email'
        },
        password: {
            optional: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Password must be at least 2 characters long'
        },
        state: {
            optional: true,
            notEmpty: true,
            errorMessage: 'State is required'
        }
    })
}
