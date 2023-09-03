const express = require('express');
const route = express.Router();
const adminController = require('../controllers/user');



route.post('/signup',adminController.signup);
route.post('/login',adminController.login);


module.exports = route;