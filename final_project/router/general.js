const express = require('express');
const axios = require('axios'); // Axios included if needed for external API calls
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Task 10: Get the book list available in the shop using Promises
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("Error: Books not available");
    }
  })
    .then(books => res.status(200).json({ message: "List of books available in the shop:", books }))
    .catch(err => res.status(500).json({ message: err }));
});

// Task 11: Get book details based on ISBN using Async/Await
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      res.status(200).json({ message: "Book details:", book: books[isbn] });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});

// Task 12: Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
  new Promise((resolve, reject) => {
    const author = req.params.author;
    const matchingBooks = Object.values(books).filter(book => book.author === author);
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found by this author");
    }
  })
    .then(matchingBooks => res.status(200).json({ message: `Books by author: ${req.params.author}`, books: matchingBooks }))
    .catch(err => res.status(404).json({ message: err }));
});

// Task 13: Get book details based on title using Async/Await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const matchingBooks = Object.values(books).filter(book => book.title === title);
    if (matchingBooks.length > 0) {
      res.status(200).json({ message: `Books with title: ${title}`, books: matchingBooks });
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});

// Task 5: Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json({
      message: `Reviews for book with ISBN ${isbn}:`,
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
