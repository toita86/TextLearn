const express = require('express');
const pool = require('./db')
const bodyParser = require('body-parser');
const path = require('path');
const port = 8080;

const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/upload', (req, res) => {
    res.render('upload');
});

app.get('/settings', (req, res) => {
    res.render('settings');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(port, () => console.log(`Server is running on port ${port}`));