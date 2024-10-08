// Import required modules
require('pg');
const Sequelize = require('sequelize');

// Initialize Sequelize with PostgreSQL connection details
var sequelize = new Sequelize('WEBASSIGNMENT6', 'WEBASSIGNMENT6_owner', 'bWOv85JBwNjA', {     
    host: 'ep-still-term-a5ug9c1g.us-east-2.aws.neon.tech',     
    dialect: 'postgres',     
    port: 5432,     
    dialectOptions: { 
        ssl: { 
            rejectUnauthorized: false 
        } 
    }, 
    query: { raw: true } 
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
}, {
    tableName: 'courses',
    timestamps: false
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: {
        type: Sequelize.INTEGER,
        references: {
            model: Course,
            key: 'courseId'
        }
    }
}, {
    tableName: 'students',
    timestamps: false
});

// Define the relationship between Student and Course
Course.hasMany(Student, { foreignKey: 'course' });
Student.belongsTo(Course, { foreignKey: 'course' });

// Function to initialize the database connection and synchronize models
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync() // Synchronize all defined models with the database
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("Unable to sync the database: " + err);
            });
    });
}

// Function to retrieve all students from the database
function getAllStudents() {
    return new Promise((resolve, reject) => {
        Student.findAll() // Fetch all students
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to retrieve all courses from the database
function getCourses() {
    return new Promise((resolve, reject) => {
        Course.findAll() // Fetch all courses
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject("Error fetching courses: " + err);
            });
    });
}

// Function to retrieve students by their course ID
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { course: course } }) // Fetch students by course ID
            .then(data => {
                if (data.length > 0) {
                    resolve(data);
                } else {
                    reject("no results returned");
                }
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to retrieve a student by their student number
function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        Student.findOne({ where: { studentNum: num } }) // Fetch student by student number
            .then(data => {
                if (data) {
                    resolve(data);
                } else {
                    reject("no results returned");
                }
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to add a new student to the database
function addStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false; // Ensure TA is a boolean
        
        // Replace blank values with null
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.create(studentData) // Create a new student record
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create student");
            });
    });
}

// Function to retrieve a course by its ID
function getCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.findOne({ where: { courseId: id } }) // Fetch course by ID
            .then(data => {
                if (data) {
                    resolve(data);
                } else {
                    reject("no results returned");
                }
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

// Function to update a student's details
function updateStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false; // Ensure TA is a boolean

        // Replace blank values with null
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.update(studentData, { // Update student record
            where: { studentNum: studentData.studentNum }
        })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to update student");
            });
    });
}

// Function to add a new course to the database
function addCourse(courseData) {
    return new Promise((resolve, reject) => {
        // Replace blank values with null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        Course.create(courseData) // Create a new course record
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create course");
            });
    });
}

// Function to update a course's details
function updateCourse(courseData) {
    return new Promise((resolve, reject) => {
        // Replace blank values with null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        Course.update(courseData, { // Update course record
            where: { courseId: courseData.courseId }
        })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to update course");
            });
    });
}

// Function to delete a course by its ID
function deleteCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.destroy({ // Remove course record
            where: { courseId: id }
        })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to delete course");
            });
    });
}

// Function to delete a student by their number
function deleteStudentByNum(studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({ // Remove student record
            where: {
                studentNum: studentNum
            }
        })
        .then(() => resolve())
        .catch((err) => reject("Unable to delete student / Student not found"));
    });
}

// Export functions for use in other modules
module.exports = {
    initialize,
    getAllStudents,
    getCourses,
    getStudentsByCourse,
    getStudentByNum,
    addStudent,
    getCourseById,
    updateStudent,
    addCourse,
    updateCourse,
    deleteCourseById,
    deleteStudentByNum
};
