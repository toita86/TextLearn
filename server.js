const express = require('express');
const session = require('express-session');
const pool = require('./db')
const PgSession = require('connect-pg-simple')(session);
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

// Middleware to use sessions
app.use(session({
    store: new PgSession({
        pool: pool, // Connection pool
        tableName: 'session', // Use the session table we created
    }),
    secret: 'your_secret_key', // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

const bcrypt = require("bcryptjs");
const { user } = require('pg/lib/defaults');

// ROUTES
app.get('/', (req, res) => {
    res.render('index',{
        isAuth: req.session.isAuth
    });
});

app.get('/login', (req, res) => {
    res.render('login',{
        msgToUser: false
    });
});

app.post('/login', async (req, res)  => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);

    try {
        // Check if user with that email is in the database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0];
        if (!user) return res.status(401).render('login', {
            msgToUser: 'User not found'
        });

        // Check if the hashed password matches with the one in the database
        const registeredPassword = user.password_digest;
        const passwordMatch = await bcrypt.compare(password, registeredPassword);
        if (!passwordMatch) return res.status(401).render('login', {
            msgToUser: 'Wrong Password'
        });
        
        req.session.user = user;
        req.session.isAuth = true;

        // If the password matches, log user in and redirect to settings page
        return res.redirect('settings');
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
            msgToUser: 'User registered!'
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
    if(req.session.isAuth == true){
        res.render('settings',{
            user: req.session.user
        });
    } else {
        res.render('login', {
            msgToUser: "Log in first"
        });
    }
});

app.post('/settings', async (req, res) => {
    const currentName = req.session.user.name;
    const { updtname, updtbio } = req.body;

    try {
        // Fetch the current user data
        const result = await pool.query('SELECT name FROM users WHERE name = $1', [currentName]);
        const db_name = result.rows[0] ? result.rows[0].name : null;

        // Check if the current name exists and user is authenticated
        if (db_name && req.session.isAuth) {
            // Update the user's name if it's different from the new name
            if (db_name !== (updtname == "" ? currentName : updtname)) {
                await pool.query('UPDATE users SET name = $1 WHERE name = $2', [updtname, currentName]);
                if(!updtbio == ""){
                    await pool.query('UPDATE users SET bio = $1 WHERE name = $2', [updtbio, updtname]);
                }
            } else {
                await pool.query('UPDATE users SET bio = $1 WHERE name = $2', [updtbio, currentName]);
            }
        }

        // Fetch the updated user data
        const updatedResult = await pool.query('SELECT * FROM users WHERE email = $1', [req.session.user.email]);
        const user = updatedResult.rows[0];

        // Update the session user object
        req.session.user = user;

        // Render the settings page with the updated user data
        return res.render('settings', {
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        return res.send("An error occurred");
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(port, () => console.log(`Server is running on port ${port}`));