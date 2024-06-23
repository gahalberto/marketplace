const { checkSchema } = require('express-validator');

module.exports = {
    // Schema validation for user signup
    signup: checkSchema({
        name: {
            trim: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Name must be at least 2 characters long'
        },
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'Invalid email'
        },
        password: {
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Password must be at least 2 characters long'
        },
        state: {
            notEmpty: true,
            errorMessage: 'State is required'
        }
    }),
    
    // Schema validation for user signin
    signIn: checkSchema({
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'Invalid email'
        },
        password: {
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Password must be at least 2 characters long'
        }
    })
}
