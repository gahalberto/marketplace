const express = require('express');
const router = express.Router();

const Auth = require('./middlewares/Auth');
const AuthValidator = require('./validators/AuthValidator');

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const AdsController = require('./controllers/AdsController');
const UserValidator = require('./validators/UserValidator');

// Health check endpoint
router.get('/ping', (req, res) => res.json({ pong: true }));

// Get states
router.get('/states', UserController.getStates);

// User authentication routes
router.post('/user/signin', AuthValidator.signIn, AuthController.signin);
router.post('/user/signup', AuthValidator.signup, AuthController.signup);

// User information routes
router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me', UserValidator.editAction, Auth.private, UserController.editAction);

// Get categories
router.get('/categories', AdsController.getCategories);

// Ad routes
router.post('/ad/add', Auth.private, AdsController.addAction);
router.get('/ad/list', AdsController.getList);
router.get('/ad/item', AdsController.getItem);
router.post('/ad/:id', Auth.private, AdsController.editAction);

module.exports = router;
