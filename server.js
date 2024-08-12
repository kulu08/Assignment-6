
/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
* Name:Kulpreet Singh Student  ID:160902235  Date: 11 August 2024
*
*  Online (vercel) Link: 
*
********************************************************************************/ 
// Define the port to listen on (default to 8080 if not set)
var HTTP_PORT = process.env.PORT || 8080;

// Import required modules
var express = require("express");
var exphbs = require('express-handlebars');
var path = require("path");
const { initialize } = require("./modules/collegeData");
var collegeData = require("./modules/collegeData");

// Create an Express application
var app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.static(__dirname + "/public/"));

// Set the views directory and view engine
app.set('views', path.join(__dirname, 'views'));

// Setup Handlebars with custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        // Helper to set active class for navigation links
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        // Helper to check if two values are equal
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        // Helper to evaluate conditions
        ifCond: function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        }
    }
});

// Register Handlebars engine with Express
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware function to set the activeRoute property in app.locals
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Add body-parser middleware to handle form data
app.use(express.urlencoded({ extended: true }));

// Define routes

// GET /students - Retrieve and render a list of students, optionally filtered by course
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then(data => {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    } else {
        collegeData.getAllStudents()
            .then(data => {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    }
});

// GET /courses - Retrieve and render a list of courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            if (data.length > 0) {
                res.render("courses", { courses: data });
            } else {
                res.render("courses", { message: "no results" });
            }
        })
        .catch(err => {
            res.render("courses", { message: "no results" });
        });
});

// GET / - Render the home page
app.get("/", (req, res) => {
    res.render('home');
});

// GET /about - Render the about page
app.get("/about", (req, res) => {
    res.render('about');
});

// GET /htmlDemo - Render the HTML demo page
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

// GET /students/add - Render the form to add a new student
app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            res.render("addStudent", { courses: data });
        })
        .catch((err) => {
            res.render("addStudent", { courses: [] });
        });
});

// POST /students/add - Handle adding a new student
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to add student");
        });
});

// GET /course/:id - Retrieve and render details for a specific course
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(data => {
            res.render("course", { course: data });
        })
        .catch(err => {
            res.status(404).send("Course not found");
        });
});

// GET /student/:studentNum - Retrieve and render details for a specific student
app.get("/student/:studentNum", (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then((studentData) => {
            if (studentData) {
                viewData.student = studentData;
            } else {
                viewData.student = null;
            }
        })
        .catch((err) => {
            viewData.student = null;
        })
        .then(() => {
            return collegeData.getCourses();
        })
        .then((courseData) => {
            viewData.courses = courseData;

            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        })
        .catch((err) => {
            viewData.courses = [];
        })
        .then(() => {
            if (viewData.student == null) {
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData });
            }
        });
});

// POST /student/update - Handle updating student details
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
});

// GET /courses/add - Render the form to add a new course
app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

// POST /courses/add - Handle adding a new course
app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(err => {
            res.status(500).send("Unable to add course");
        });
});

// POST /course/update - Handle updating course details
app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(err => {
            res.status(500).send("Unable to update course");
        });
});

// GET /course/delete/:id - Handle deleting a specific course
app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => {
            res.redirect("/courses");
        })
        .catch(err => {
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});

// GET /student/delete/:studentNum - Handle deleting a specific student
app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

// 404 Error - Handle requests to undefined routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

// Initialize and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("server listening on port: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.log("Unable to start server: " + err);
    });

// Export the app for testing or other purposes
module.exports = app;
