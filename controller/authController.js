// authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/user');

const jwtSecret = process.env.JWT_SECRET;

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: true,
                message: 'Invalid email format',
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: true,
                message: 'Password must be at least 8 characters long',
            });
        }

        const existingUser = await db.User.findOne({
            where: {
                email: email
            },
        });

        if (existingUser) {
            return res.status(400).json({
                error: true,
                message: 'Email is already registered',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.User.create({
            name: name,
            email: email,
            password: hashedPassword,
        });

        res.status(201).json({
            error: false,
            message: 'User Created',
            user: {
                userId: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            message: 'Internal Server Error',
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = await db.User.findOne({
            where: {
                email: email
            },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                error: true,
                message: 'Email or password is incorrect',
            });
        }

        const token = jwt.sign({
                email: user.email,
                userId: user.id,
            },
            jwtSecret
        );

        res.json({
            error: false,
            message: 'Login successful',
            loginResult: {
                userId: user.id,
                name: user.name,
                token: token,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            message: 'Internal Server Error',
        });
    }
};

module.exports = {
    register,
    login,
};

// Di dalam file authController.js atau file controller terpisah
const cloudStorageBucket = require('../path/to/cloudStorage');

const uploadImage = async (req, res) => {
    try {
        const image = req.file; // Ambil gambar dari request

        // Upload gambar ke Cloud Storage
        const file = cloudStorageBucket.file(`${Date.now()}_${image.originalname}`);
        const stream = file.createWriteStream({
            metadata: {
                contentType: image.mimetype,
            },
        });

        stream.on('error', (err) => {
            console.error(err);
            res.status(500).json({
                error: true,
                message: 'Error uploading image',
            });
        });

        stream.on('finish', () => {
            const imageUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;
            res.json({
                error: false,
                message: 'Image uploaded successfully',
                imageUrl: imageUrl,
            });
        });

        stream.end(image.buffer); // Mulai unggah gambar
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            message: 'Internal Server Error',
        });
    }
};

module.exports = {
    uploadImage,
};