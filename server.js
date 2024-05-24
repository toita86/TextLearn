const express = require('express');
const session = require('express-session');
const pool = require('./db')
const PgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const { user } = require('pg/lib/defaults');
const multer = require('multer');
const path = require('path');
const port = 8080;

const app = express();

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

app.get('/session-data', async (req, res) => {
    if (!req.session.isAuth) {
        res.json({ isAuth: false });
        return;
    }
    res.json({ 
        isAuth: req.session.isAuth,
        username: req.session.user.name,
        bio: req.session.user.bio
    });
});

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/'); // Set upload directory
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  // Init upload
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Set file size limit (optional)
    fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
    }
  }).fields([
    { name: 'course_image', maxCount: 1 },
    { name: 'course_file', maxCount: 1 }
  ]);
  
  // Check file type
  function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|md/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and Mark Down documents only!');
    }
  }

// ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
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
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email already exists
        const result = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
        const existingUser = result.rows;
        if (existingUser.length > 0) {
            return res.render('signup', {
                msgToUser: 'This email is already in use'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert the new user
        await pool.query('INSERT INTO users (name, email, password_digest) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

        // Render the success message
        return res.redirect('login');
    } catch (error) {
        console.error(error);
        return res.redirect('signup');
    }
});

app.get('/upload', (req, res) => {
    if(req.session.isAuth == true){
        res.sendFile(path.join(__dirname, 'views', 'upload.html'));
    } else {
        res.redirect('login');
    }
});

// const upload_form = upload.fields([{ name: 'course_image', maxCount: 1 }, { name: 'course_file', maxCount: 1 }])

// app.post('/upload', upload_form,  async function (req, res) {
//     // upload(req, res, async (err) => {
//     //     if (err) {
//     //       return res.render('upload', {
//     //         msgToUser: err
//     //       });
//     //     } else {
//     const { course_name, course_descr } = req.body;
//     const course_image = req.files['course_image'][0].path;
//     const course_file = req.files['course_file'][0].path;
    
//     try {
//         //const user_id = await pool.query('SELECT id FROM users WHERE email = $1', [req.session.user.email]);
//         const courses_title = await pool.query('SELECT title FROM courses WHERE author_id = $1', [req.session.user.id]);
//         // iterarte through the courses_title array to check if the course title already exists in the database
//         for (let i = 0; i < courses_title.rows.length; i++) {
//             const course = courses_title.rows[i].title;
//             if (course === course_name) {
//                 console.log("Course already exists");
//                 return res.render('upload', {
//                     msgToUser: 'Course already exists',
//                     user: req.session.user
//                 });
//             }
//         }    
//         //otherwise, upload the course to the database
//         await pool.query('INSERT INTO courses (author_id, title, descr, thumbnail_path, file_path) VALUES ($1, $2, $3, $4, $5)', [req.session.user.id, course_name, course_descr, course_image, course_file]);
        
//         return res.render('upload', {
//             msgToUser: 'Course uploaded successfully',
//             user: req.session.user
//         });
//     } catch (error) {
//         console.error(error);
//         return res.render('upload', {
//             msgToUser: 'An error occured',
//             user: req.session.user
//         });
//     }
//     //     }
//     // });
// });

app.get('/settings', (req, res) => {
    if(req.session.isAuth == true){
        res.sendFile(path.join(__dirname, 'views', 'settings.html'));
    } else {
        return res.redirect('login');    
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
        return res.redirect('settings');
    } catch (error) {
        console.error(error);
        return res.send("An error occurred");
    }
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/marketplace', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'marketplace.html'));
});

app.listen(port, () => console.log(`Server is running on port ${port}`));