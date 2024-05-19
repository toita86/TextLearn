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
app.use(express.urlencoded({extended: 'false'}))

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json())

const bcrypt = require("bcryptjs")

// ROUTES
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res)  => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);

    try {
        // Check if user with that email is in the database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0];
        if (!user) return res.status(401).send('User not found');

        // Check if the hashed password matches with the one in the database
        const registeredPassword = user.password_digest;
        const passwordMatch = await bcrypt.compare(password, registeredPassword);
        if (!passwordMatch) return res.status(401).send('Incorrect password');

        // If the password matches, log user in and redirect to settings page
        return res.render('settings', {
            message: 'User logged in!'
        });
    } catch (error) {
        console.error(error);
        return res.send("An error occurred");
    }
});   

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email already exists
        const result = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
        const existingUser = result.rows;
        if (existingUser.length > 0) {
            return res.render('register', {
                message: 'This email is already in use'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert the new user
        await pool.query('INSERT INTO users (name, email, password_digest) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

        // Render the success message
        return res.render('login', {
            message: 'User registered!'
        });
    } catch (error) {
        console.error(error);
        return res.send("An error occurred");
    }
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