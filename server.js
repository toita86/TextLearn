const express = require('express');
const pool = require('./db')
const port = 8080;

const app = express();

// Routes
app.get('/', (req, res) => {
    res.sendStatus(200);
})


app.listen(port, () => console.log(`Server is running on port ${port}`));