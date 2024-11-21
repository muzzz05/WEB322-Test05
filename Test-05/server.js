const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const path = require('path')
const HTTP_PORT = process.env.PORT || 8080;

// Database Connection
const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'fzPV9Xgk0ObK', {
    host: 'ep-tight-mouse-a5haf5pm-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

// Authenticate Connection
sequelize.authenticate()
    .then(() => console.log('Connection to PostgreSQL successful.'))
    .catch((err) => console.error('Unable to connect to the database:', err));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'studentInfo.html'));
    });    

// Define Student Schema
const Student = sequelize.define('Student', {
    student_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    enrollment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    courses: {
        type: Sequelize.JSONB,
        allowNull: true,
    },
}, {
    timestamps: false, // Disable createdAt and updatedAt
});

// Sync Database and Create Table
sequelize.sync({ force: false })
    .then(() => console.log('Table "students" is ready'))
    .catch((err) => console.error('Error syncing with the database:', err));

// Middleware
app.use(bodyParser.json());

// API Endpoints

// 1. POST /students: Create a new student
app.post('/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. GET /students: Retrieve all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET /students/:student_id: Retrieve a specific student
app.get('/students/:student_id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.student_id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT /students/:student_id: Update a student's details
app.put('/students/:student_id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.student_id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        await student.update(req.body);
        res.json({ message: 'Student updated successfully.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. DELETE /students/:student_id: Delete a student
app.delete('/students/:student_id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.student_id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        await student.destroy();
        res.json({ message: 'Student deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the Server
app.listen(HTTP_PORT, () => console.log(`Server running on port ${HTTP_PORT}`));
