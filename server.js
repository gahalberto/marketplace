require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Import express
const mongoose = require('mongoose'); // Import mongoose for MongoDB connection
const cors = require('cors'); // Import CORS middleware
const fileupload = require('express-fileupload'); // Import file upload middleware

const apiRoutes = require('./src/routes'); // Import API routes

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.DATABASE, {});
mongoose.Promise = global.Promise; // Use global Promise for Mongoose
mongoose.connection.on('error', (error) => {
    console.log('Error: ', error.message); // Log connection errors
});

const server = express(); // Create an Express server

server.use(cors()); // Enable CORS for all routes
server.use(express.json()); // Parse JSON request bodies
server.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
server.use(fileupload()); // Enable file upload handling

server.use(express.static(__dirname + '/public')); // Serve static files from the 'public' directory

server.use('/', apiRoutes); // Use API routes for all requests to the root path

// Start the server on the specified port
server.listen(process.env.PORT, () => {
    console.log(`Server running on: ${process.env.BASE}`);
});
