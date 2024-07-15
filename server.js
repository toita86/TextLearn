const express = require("express");
const session = require("express-session");
const pool = require("./db");
const PgSession = require("connect-pg-simple")(session);
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const marked = require("marked");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const { user } = require("pg/lib/defaults");
const multer = require("multer");
const path = require("path");
const port = 8080;

const app = express();

/* ====================== MIDDLEWARES ====================== */

// Set the views directory
app.set("views", path.join(__dirname, "views"));
// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware to parse request body with URL codification
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: "false" }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse request body as JSON
app.use(express.json());

// Middleware to use sessions
app.use(
  session({
    store: new PgSession({
      pool: pool, // Connection pool
      tableName: "session", // Use the session table we created
    }),
    secret: "your_secret_key", // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, //cookies last 30 days
      sameSite: "Strict", // Allows the cookie to be sent in all contexts
    }, // 30 days
  })
);

/*
  Gets the user's data from the session. 
  If there is no user logged in then it will return null.
*/
app.get("/session-data", (req, res) => {
  if (!req.session.isAuth) {
    res.json({
      isAuth: false,
      msgToUser: req.session.msgToUser,
    });
    return;
  }
  return res.json({
    isAuth: req.session.isAuth,
    username: req.session.user.name,
    bio: req.session.user.bio,
    msgToUser: req.session.msgToUser,
  });
});

/* ====================== MUTLER ====================== */
// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set upload directory
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload for the courses upload page
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000000 }, // Set file size limit (optional)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).fields([
  { name: "course_image", maxCount: 1 },
  { name: "course_file", maxCount: 1 },
]);

// File filter function
function checkFileType(file, cb) {
  const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];
  const allowedFileTypes = ["text/markdown"];

  if (file.fieldname === "course_image") {
    if (allowedImageTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(
        new Error("Invalid image type. Only PNG, JPG, and JPEG are allowed."),
        false
      );
    }
  } else if (file.fieldname === "course_file") {
    if (allowedFileTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error("Invalid file type. Only MD is allowed."), false);
    }
  } else {
    return cb(new Error("Invalid file field."), false);
  }
}

// Set storage for the ppics
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile_pics/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

// Init upload for the pp upload page
const uploadProPic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 100000000 }, // Set file size limit (optional)
  fileFilter: function (req, file, cb) {
    checkPPicType(file, cb);
  },
}).single("prof_pic");

function checkPPicType(file, cb) {
  //Allowed ext
  const filetypes = /jpeg|jpg|png/;
  const mimetypes = /image\/jpeg|image\/jpg|image\/png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = mimetypes.test(file.mimetype); //control if this is a mime type

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new Error("Error: Images only!"));
  }
}

// Init upload for the updating the courses .md
const updateCourse = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== ".md") {
      return cb(new Error("Error: md files only!"));
    }
    return cb(null, true);
  },
}).single("course_upd");

/* ====================== ROUTES ====================== */

/* ================ HOME page Routes ================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

/* ================ LOGIN page Routes ================ */
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

/* 
This route is triggered when the user submits their email and password on the login page. 
The server then checks if there is a user with that email address in the database, and if the password matches the one stored in the database. 
If both conditions are met, the user is logged in and redirected to the "settings" page.
*/
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user with that email is in the database
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) {
      req.session.msgToUser = "User not found";
      return res.redirect("login");
    }

    // Check if the hashed password matches with the one in the database
    const registeredPassword = user.password_digest;
    const passwordMatch = await bcrypt.compare(password, registeredPassword);
    if (!passwordMatch) {
      req.session.msgToUser = "Wrong Password";
      return res.redirect("login");
    }
   
    req.session.msgToUser = "";
    req.session.user = user; //update the user sessione. Takes all user data from the db
    req.session.isAuth = true; //user is authenticated

    // If the password matches, log user in and redirect to settings page
    return res.redirect("settings");
  } catch (error) {
    console.error(error);
    return res.send("An error occurred");
  }
});

/* ================ SIGNUP page Routes ================ */
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});

/*
This endpoint, which handles user signup functionality. 
It validates user input, checks if the email already exists in the database, and creates a new user with a hashed password. 
If any errors occur during processing, it logs an error message to the console and redirects the user back to the signup page.
*/
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists
    const result = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );
    const existingUser = result.rows;
    if (existingUser.length > 0) {
      req.session.msgToUser = "Email already in use";
      return res.redirect("signup");
    }

    if (name === "" || email === "" || password === "") {
      req.session.msgToUser = "Please fill in all fields";
      return res.redirect("signup");
    } else if (password.length < 8) {
      req.session.msgToUser = "Password must be at least 8 characters long";
      return res.redirect("signup");
    } else if (emailCheck(email) === null) {
      req.session.msgToUser = "Invalid email";
      return res.redirect("signup");
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Insert the new user
    await pool.query(
      "INSERT INTO users (name, email, password_digest) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    // Render the success message
    req.session.msgToUser = "User registered!";
    return res.redirect("login");
  } catch (error) {
    console.error(error);
    return res.redirect("signup");
  }
});

function emailCheck(email) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

/* ================ UPLOAD page Routes ================ */
app.get("/upload", (req, res) => {
  if (req.session.isAuth == true) {
    //authentication is required
    res.sendFile(path.join(__dirname, "views", "upload.html"));
  } else {
    req.session.msgToUser = "Log in first!";
    res.redirect("login");
  }
});

/*
In this post request we will upload the file to the server.
We will use the multer middleware `upload` for uploading files.
There are various checks that we need to do before actually uploading a file.
*/
app.post("/upload", function (req, res) {
  //upload courses by user
  if (req.session.isAuth == true) {
    upload(req, res, async function (err) {
      //async because we have to wait the queries elaborations
      if (err) {
        // Handle file type errors
        if (err.message === "Error: Images and Markdown documents only!") {
          req.session.msgToUser =
            "Only .jpg, .png images and .md documents are allowed";
          return res.redirect("upload");
        }

        // Handle other multer errors
        req.session.msgToUser = "An error occurred during file upload";
        return res.redirect("upload");
      }

      try {
        const { course_name, course_descr } = req.body;

        const course_image = req.files["course_image"][0].path;
        const course_file = req.files["course_file"][0].path;

        const courses_title = await pool.query(
          "SELECT title FROM courses WHERE author_id = $1",
          [req.session.user.id]
        );

        // Iterate through the courses_title array to check if the course title already exists in the database
        for (let i = 0; i < courses_title.rows.length; i++) {
          const course = courses_title.rows[i].title;
          if (course === course_name) {
            req.session.msgToUser = "Course already exists";
            return res.redirect("upload");
          }
        }

        if (course_name.length < 5 || course_name.length > 15) {
          req.session.msgToUser =
            "Course title must be between 5 and 15 characters long";
          return res.redirect("upload");
        }

        // Otherwise, upload the course to the database
        await pool.query(
          "INSERT INTO courses (author_id, title, descr, thumbnail_path, file_path) VALUES ($1, $2, $3, $4, $5)",
          [
            req.session.user.id,
            course_name,
            course_descr,
            course_image,
            course_file,
          ]
        );

        req.session.msgToUser = "Course uploaded successfully";
        return res.redirect("upload");
      } catch (error) {
        console.error(error);
        if (error.TypeError !== null) {
          req.session.msgToUser = "No files selected";
          return res.redirect("upload");
        }
        req.session.msgToUser = "An error occurred";
        return res.redirect("upload");
      }
    });
  } else {
    req.session.msgToUser = "Log in first!";
    res.redirect("login");
  }
});

app.post("/update-course/:id", async (req, res) => {
  if (req.session.isAuth) {
    updateCourse(req, res, async (err) => {
      if (err) {
        // Handle file type errors
        if (err.message === "Error: md files only!") {
          req.session.msgToUser = "Only .md files are allowed";
          return res
            .status(400)
            .json({ message: "Only .md files are allowed" });
        }
        console.log(err);
        // Handle other multer errors
        req.session.msgToUser = "An error occurred during file upload";
        return res.status(404).json({ message: "Course not found" });
      }

      try {
        const courseId = req.params.id;

        // Check if a file is uploaded
        if (!req.file) {
          req.session.msgToUser = "No file selected";
          return res.status(400).json({ message: "No file selected" });
        }

        // Get current course details
        const course = await pool.query(
          "SELECT file_path FROM courses WHERE id = $1",
          [courseId]
        );

        if (course.rows.length === 0) {
          return res.status(404).json({ message: "Course not found" });
        }

        const oldFilePath = course.rows[0].file_path;

        // Delete the old file if it exists
        if (oldFilePath) {
          deleteFile(oldFilePath);
        }

        // Update the database with the new file path
        const newFilePath = req.file.path;
        await pool.query("UPDATE courses SET file_path = $1 WHERE id = $2", [
          newFilePath,
          courseId,
        ]);

        req.session.msgToUser = "Course file updated successfully";
        return res
          .status(200)
          .json({ message: "Course file updated successfully" });
      } catch (err) {
        console.error(err);
        req.session.msgToUser = "An error occurred during file upload";
        return res
          .status(500)
          .json({ message: "An error occurred during file upload" });
      }
    });
  } else {
    return res.status(403).json({ message: "You are not authorized" });
  }
});

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    } else {
      console.log(`Successfully deleted file: ${filePath}`);
    }
  });
}

/*
This route is used to get the user's profile picture.
If the has not uploaded a profile picture yet then it will return the default image.
*/
app.get("/pro-pic", async (req, res) => {
  try {
    if (req.session.isAuth == true) {
      const path = await pool.query(
        `SELECT picture_path FROM users WHERE id = $1`,
        [req.session.user.id]
      );
      if (path.rows[0].picture_path == null) {
        res.status(200).json({
          isAuth: true,
          imageUrl: "/images/USER.jpeg", //if image isn't uploaded we have the default image
        });
      } else {
        res.status(200).json({
          isAuth: true,
          imageUrl: path.rows[0].picture_path,
        });
      }
    } else {
      return res.status(403).send("You are not authorized");
    }
  } catch (error) {
    console.error(error);
  }
});

app.post("/update-pro-pic", (req, res) => {
  if (req.session.isAuth == true) {
    uploadProPic(req, res, async (err) => {
      if (err) {
        // Handle file type errors
        if (err.message === "Error: Images only!") {
          req.session.msgToUser = "Only .jpg, .png images are allowed";
          return res.status(400).send("Wrong image format");
        }

        // Handle other multer errors
        req.session.msgToUser = "An error occurred during file upload";
        return res.status(403).send("Wrong image format");
      }

      // returns errors if no file was uploaded
      if (!req.file) {
        req.session.msgToUser = "No file selected";
        return res.status(400).send("No file selected");
      }

      try {
        const prof_pic = req.file.path;

        await pool.query("UPDATE users SET picture_path = $1 WHERE id = $2", [
          prof_pic,
          req.session.user.id,
        ]);

        res.status(200).json({
          imageUrl: prof_pic,
          msgToUser: "Image uploaded successfully",
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          msgToUser: "An error occurred during file upload",
        });
      }
    });
  } else {
    req.session.msgToUser = "Log in first!";
    res.redirect("login");
  }
});

/*
This route gets the user's courses.
*/
app.get("/user-courses", async (req, res) => {
  if (!req.session.isAuth) {
    return res.json({ isAuth: false, courses: [] });
  }
  try {
    const result = await pool.query(
      "SELECT id, title FROM courses WHERE author_id = $1",
      [req.session.user.id]
    );
    return res.json({ isAuth: true, courses: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      isAuth: true,
      courses: [],
      error: "An error occurred while fetching courses",
    });
  }
});

/*
Manages the user's subscription to a course.
*/
app.post("/subscribe/:id", async (req, res) => {
  const courseId = req.params.id;
  if (!req.session.isAuth) {
    req.session.msgToUser = "You must be logged in to subscribe";
    return res
      .status(403)
      .json({ message: "You must be logged in to subscribe" });
  }
  try {
    const preSubVerification = await pool.query(
      "SELECT * FROM user_sub_courses WHERE user_id=$1 AND course_id=$2",
      [req.session.user.id, courseId]
    );
    if (preSubVerification.rowsCount > 0) {
      req.session.msgToUser = "You already subscribed to this course";
      return res
        .status(403)
        .json({ message: "You already subscribed to this course" });
    }

    const result = await pool.query(
      "INSERT INTO user_sub_courses (user_id, course_id, subscription_date) VALUES ($1, $2, $3) RETURNING *",
      [req.session.user.id, courseId, new Date()]
    );
    if (result.rowsCount === 0) {
      req.session.msgToUser = "There was an error while subscribing";
      return res
        .status(503)
        .json({ message: "There was an error while subscribing" });
    } else {
      return res.status(200).json({
        message: "Subscribed to course successfully!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occured while fetching courses",
      isAuth: true,
    });
  }
});

/*
Manages the user's unsubscription to a course.
*/
app.delete("/unsub-course/:id", async (req, res) => {
  const courseId = req.params.id;
  if (!req.session.isAuth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM user_sub_courses WHERE user_id = $1 AND course_id = $2 RETURNING *",
      [courseId, req.session.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "Subscription not found or not authorized to unsubscribe this course",
      });
    }
    return res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while unsubscribing the course" });
  }
});

/*
Gets the user's subscriptions.
*/
app.get("/user-sub-courses", async (req, res) => {
  if (!req.session.isAuth) {
    return res.json({ isAuth: false, courses: [] });
  }

  try {
    // Fetch subscribed course IDs
    const subedCourses = await pool.query(
      "SELECT course_id FROM user_sub_courses WHERE user_id = $1",
      [req.session.user.id]
    );

    // Collect course details
    /*the collection of course details is created using the map() method on the subedCourses.rows array. 
    The map() method takes a function that returns a new value for each element in the array, and applies it to every element in the array, 
    returning a new array with the mapped values.
    In this case, the function is an arrow function that takes a single argument, which is the course ID, 
    and returns a promise for the result of fetching the course details for that particular course. 
    The resulting promises are then collected in an array using Promise.all(), 
    which allows us to wait for all of them to resolve before proceeding with the rest of the code.

    Once all of the promises have resolved, the coursesInfo variable will contain an array of objects, 
    where each object represents a course and contains the ID, title, and other relevant details for that course. */
    const coursesInfoPromises = subedCourses.rows.map(async (course) => {
      const result = await pool.query(
        "SELECT id, title FROM courses WHERE id = $1",
        [course.course_id]
      );
      return result.rows[0]; // Assuming there is exactly one course per id
    });

    const coursesInfo = await Promise.all(coursesInfoPromises);

    return res.json({ isAuth: true, courses: coursesInfo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      isAuth: true,
      courses: [],
      error: "An error occurred while fetching courses",
    });
  }
});

app.delete("/delete-course/:id", async (req, res) => {
  const courseId = req.params.id;
  if (!req.session.isAuth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM courses WHERE id = $1 AND author_id = $2 RETURNING *",
      [courseId, req.session.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Course not found or not authorized to delete this course",
      });
    }
    return res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the course" });
  }
});

/* ================ SETTINGS page Routes ================ */

app.get("/settings", (req, res) => {
  if (req.session.isAuth == true) {
    res.sendFile(path.join(__dirname, "views", "settings.html"));
  } else {
    return res.redirect("login");
  }
});

app.post("/settings", async (req, res) => {
  const currentName = req.session.user.name;
  const { updtname, updtbio } = req.body;

  try {
    // Fetch the current user data
    const result = await pool.query("SELECT name FROM users WHERE name = $1", [
      currentName,
    ]);
    const db_name = result.rows[0] ? result.rows[0].name : null;

    // Check if the current name exists and user is authenticated
    if (db_name && req.session.isAuth) {
      // Update the user's name if it's different from the new name
      if (db_name !== (updtname == "" ? currentName : updtname)) {
        await pool.query("UPDATE users SET name = $1 WHERE name = $2", [
          updtname,
          currentName,
        ]);
        if (!updtbio == "") {
          await pool.query("UPDATE users SET bio = $1 WHERE name = $2", [
            updtbio,
            updtname,
          ]);
        }
      } else {
        if (!updtbio == "") {
          await pool.query("UPDATE users SET bio = $1 WHERE name = $2", [
            updtbio,
            currentName,
          ]);
        }
      }
    }

    // Fetch the updated user data
    const updatedResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [req.session.user.email]
    );
    const user = updatedResult.rows[0];

    // Update the session user object
    req.session.user = user;

    // Render the settings page with the updated user data
    return res.redirect("settings");
  } catch (error) {
    console.error(error);
    return res.send("An error occurred");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out.");
    }
    res.clearCookie("connect.sid", {
      path: "/",
      sameSite: "None",
      secure: true,
    }); // This line ensures the cookie is cleared
    res.sendStatus(200);
  });
});

app.delete("/remove-account", async (req, res) => {
  if (!req.session.isAuth) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.session.user.id]);
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Failed to log out.");
      }
      res.clearCookie("connect.sid", {
        path: "/",
        sameSite: "None",
        secure: true,
      }); // This line ensures the cookie is cleared
      res.sendStatus(200);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ================ ABOUT page Routes ================ */

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

/* ================ MARKETPLACE page Routes ================ */
app.get("/marketplace", async (req, res) => {
  req.session.msgToUser = "";
  res.sendFile(path.join(__dirname, "views", "marketplace.html"));
});

app.get("/marketplace-courses", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT courses.id, courses.title, courses.descr, courses.thumbnail_path, users.name as author_name 
       FROM courses 
       JOIN users ON courses.author_id = users.id`
    );
    return res.status(200).json({
      isAuth: req.session.isAuth,
      courses: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      isAuth: req.session.isAuth,
      courses: [],
      error: "An error occurred while fetching courses",
    });
  }
});

app.post("/marketplace-search", async (req, res) => {
  const searchQuery = req.body.query;

  try {
    const result = await pool.query(
      `SELECT courses.id, courses.title, courses.thumbnail_path, users.name as author_name 
       FROM courses 
       JOIN users ON courses.author_id = users.id
       WHERE title ILIKE $1`,
      [`%${searchQuery}%`]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({message: "No courses found", courses: []}); //return an empty element
    }

    return res.status(200).json({message: null, courses: result.rows});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================ READER page Routes ================ */

app.get("/reader/:id", (req, res) => {
  try {
    if (req.session.isAuth == true) {
      req.session.msgToUser = "";
      res.sendFile(path.join(__dirname, "views", "reader.html"));
    } else {
      return res.redirect("/login");
    }
  } catch (err) {
    return res.redirect("/settings");
  }
});

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Route to get the HTML content of a course
app.get("/course-reader/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const isSubscribed = await pool.query(
      `SELECT * FROM user_sub_courses WHERE user_id=$1 AND course_id=$2`,
      [req.session.user.id, courseId]
    );

    const isAuthor = await pool.query(
      `SELECT * FROM courses WHERE id=$1 AND author_id=$2`,
      [courseId, req.session.user.id]
    );

    if (!isAuthor.rows.length > 0 && !isSubscribed.rows.length > 0) {
      req.session.msgToUser = "You are not subscribed to this course";
      return res.json({ content: "Nothing here to see..." });
    }

    const filePath = await pool.query(
      `SELECT title, descr, file_path FROM courses WHERE id=$1`,
      [courseId]
    );
    if (filePath == null) {
      return res.status(404).send("Course not found");
    }

    fs.readFile(filePath.rows[0].file_path, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return res.status(404).send("Course not found");
      }

      // Convert markdown to HTML
      const htmlContent = marked.parse(data);
      const sanitizedContent = DOMPurify.sanitize(htmlContent);

      // Send HTML content as JSON response
      res.status(200).json({
        courseTitle: filePath.rows[0].title,
        description: filePath.rows[0].descr,
        content: sanitizedContent,
      });
    });
  } catch (err) {
    return res.status(404).send("Course not found");
  }
});

/*
Simple endpoint to get course Author's Data
*/
app.get("/creator-data/:id", async (req, res) => {
  try {
    if (req.session.isAuth == true) {
      const courseId = req.params.id;
      const creatorId = await pool.query(
        `SELECT author_id FROM courses WHERE id=$1`,
        [courseId]
      );
      const creatorData = await pool.query(
        `SELECT name, picture_path, bio FROM users WHERE id=$1`,
        [creatorId.rows[0].author_id]
      );

      res.status(200).json({
        name: creatorData.rows[0].name,
        imageUrl: creatorData.rows[0].picture_path,
        bio: creatorData.rows[0].bio,
      });
    } else {
      return res.status(403).send("Unauthorized");
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send("Creator data not found");
  }
});

/* ================ START server ================ */

app.listen(port, () => console.log(`Server is running on port ${port}`));
