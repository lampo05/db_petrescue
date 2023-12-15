// petRoutes.js
const express = require('express');
const petController = require('../controllers/petController');
const authController = require('./controllers/authController');

const router = express.Router();

router.get('/lost', petController.getAllLostPets);
router.get('/found', petController.getAllFoundPets);
router.get('/search', petController.searchPetByName);

router.post('/upload', petController.uploadImage);
router.post('/report', petController.reportPet);
router.post('/contact', petController.addContactInfo);
router.post('/address', petController.addAddress);
router.post('/post', petController.postPet);
router.post('/upload', authController.uploadImage);


module.exports = router;