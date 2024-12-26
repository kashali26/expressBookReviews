const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username already exists
    return !users.find(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Check if username and password match
    const user = users.find(user => user.username === username && user.password === password);
    return !!user;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });
    req.session.authorization = { token, username };

    return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user?.username; // Retrieved from the JWT token in the middleware
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
  
    if (books[isbn]) {
      books[isbn].reviews[username] = review; // Add or modify the review for this user
      return res.status(200).json({ message: "Review added/updated successfully" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user?.username; // Retrieved from the JWT token in the middleware

    if (!username) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (books[isbn] && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // Remove the review for this user
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found or unauthorized" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
