# An eBay Marketplace Clone

## Project Objective

The objective of this project is to create a complete API for a marketplace, similar to eBay.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- bcrypt for password hashing
- express-fileupload for file uploads
- cors for Cross-Origin Resource Sharing
- express-validator for request validation
- dotenv for environment variables

## Main Features

- **User Authentication**
  - Sign Up
  - Sign In

- **User Profile Management**
  - View user information
  - Edit user information

- **Ad Posting and Management**
  - Add new ads
  - Edit existing ads
  - List all ads with filters
  - View ad details

- **Category and State Management**
  - Retrieve all states
  - Retrieve all categories

- **Image Upload and Processing**
  - Upload images for ads
  - Process and store images

## My Role

I developed the entire project from scratch, implementing all features and functionalities.

## Challenges Overcome

Although this project did not present many challenges, I plan to redo the project using TypeScript, which will present a greater challenge and enhance my skills.

## How to Run the Project

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/ebay-clone.git
   ```
2. Navigate to the project directory:
   ```sh
   cd ebay-clone
```
3. Install dependencies:
  ```sh
    npm install
  ```
4. Create a .env file in the root directory and add the following environment variables:
  ```sh
  DATABASE=your-mongodb-connection-string
  PORT=your-port-number
  BASE=your-base-url
  ```
5. Start the server:
```
  npm start
```

API Endpoints
User Authentication
POST /user/signin - User sign in
POST /user/signup - User sign up
User Profile
GET /user/me - Get user information (requires authentication)
PUT /user/me - Edit user information (requires authentication)
Ad Management
POST /ad/add - Add new ad (requires authentication)
PUT /ad/:id - Edit existing ad (requires authentication)
GET /ad/list - List ads with filters
GET /ad/item - Get ad details
Miscellaneous
GET /ping - Health check
GET /states - Get all states
GET /categories - Get all categories
Future Enhancements
Rewriting the project in TypeScript for better type safety and maintainability.
Adding more advanced features such as real-time notifications, messaging between users, and payment integrations.

```

This README provides a comprehensive overview of the project, including its objective, technologies used, main features, your role, challenges overcome, and how to run the project. It also outlines the API endpoints available.
```
