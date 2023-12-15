// index.js
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const errorMiddleware = require('../middleware/errorMiddleware');
const db = require('./config/database'); // Import konfigurasi database
const User = require('./models/user'); // Import model User
const Pet = require('./models/pet'); // Import model Pet
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/pet', petRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Sync models with database
(async () => {
    try {
        await db.sync({
            force: false
        }); // force: true akan membuat tabel setiap kali server dimulai
        console.log('Database synchronized');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
})();

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
