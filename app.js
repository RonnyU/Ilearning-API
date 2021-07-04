// requires
const express = require('express');
const bodyParser = require('body-parser');

// created an Express object
const app = express();

// loading routes
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const categoryRoutes = require('./routes/category');
const subcategoryRoutes = require('./routes/subcategory');
const videoRoutes = require('./routes/video');
const commentRoutes = require('./routes/comment');
const chapterRoutes = require('./routes/chapter');
const quizRoutes = require('./routes/quiz');

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Config headers and Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// re-writing routes
app.use('/api', userRoutes);
app.use('/api', courseRoutes);
app.use('/api', categoryRoutes);
app.use('/api', subcategoryRoutes);
app.use('/api', videoRoutes);
app.use('/api', commentRoutes);
app.use('/api', chapterRoutes);
app.use('/api', quizRoutes);

// exporting the object express with the routes and configutation
module.exports = app;
