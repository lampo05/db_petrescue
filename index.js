const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_rescue'
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi ke MySQL gagal: ', err);
    } else {
        console.log('Terhubung ke MySQL');
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

    // Periksa apakah email sudah terdaftar
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Terjadi kesalahan'
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                error: 'Email sudah terdaftar'
            });
        }

        // Enkripsi password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Terjadi kesalahan'
                });
            }

            // Simpan data pengguna ke MySQL
            const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [name, email, hashedPassword], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Terjadi kesalahan'
                    });
                }

                res.status(201).json({
                    message: 'Registrasi berhasil'
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
                error: 'Terjadi kesalahan'
            });
        }

        // Periksa apakah pengguna ditemukan dan password cocok
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({
                error: 'Email atau password salah'
            });
        }

        // Hasilkan token JWT
        const token = jwt.sign({
            email: results[0].email
        }, 'secret_key');
        res.json({
            token
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});