const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    authPlugins: {
        mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0'),
    },
});

const jwtSecret = process.env.JWT_SECRET;

// Ganti metode otentikasi MySQL

db.connect((err) => {
    if (err) {
        console.error('Koneksi ke MySQL gagal: ', err);
    } else {
        console.log('Terhubung ke MySQL');
        console.log('Host Cloud SQL: ', process.env.DB_HOST);
        console.log('Nama Database: ', process.env.DB_DATABASE);
    }
});

app.use(express.json());

// Registrasi pengguna
app.post('/register', (req, res) => {
    const {
        name,
        email,
        password
    } = req.body;

    // Validasi format email menggunakan ekspresi reguler
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: true,
            message: 'invalid email format'
        });
    }

    // Validasi panjang password
    if (password.length < 8) {
        return res.status(400).json({
            error: true,
            message: 'Password must be at least 8 characters long'
        });
    }

    // Periksa apakah email sudah terdaftar
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: true,
                message: 'there is an error'
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                error: true,
                message: 'email is registered'
            });
        }

        // Enkripsi password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: true,
                    message: 'there is an error'
                });
            }

            // Simpan data pengguna ke MySQL
            const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [name, email, hashedPassword], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: true,
                        message: 'there is an error'
                    });
                }

                res.status(201).json({
                    error: false,
                    message: 'User Created'
                });
            });
        });
    });
});

// Login pengguna dan hasilkan token JWT
app.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body;

    // Temukan pengguna berdasarkan email
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(findUserQuery, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: true,
                message: 'there is an error'
            });
        }

        // Periksa apakah pengguna ditemukan dan password cocok
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({
                error: true,
                message: 'Email atau password salah'
            });
        }

        // Hasilkan token JWT
        const token = jwt.sign({
            email: results[0].email
        }, jwtSecret);
        res.json({
            error: false,
            message: 'success',
            loginResult: {
                userId: results[0].id, // Anda perlu mengganti ini dengan kolom yang sesuai dalam tabel pengguna
                name: results[0].name,
                token: token
            }
        });
    });
});

// Middleware untuk menangani kesalahan secara global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: true,
        message: 'there is an error'
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
