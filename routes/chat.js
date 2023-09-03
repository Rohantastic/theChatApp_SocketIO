const express = require('express');
const multer=require('multer');
const route=express.Router();
//place where files will be uploaded
const upload= multer({dest: 'uploads/'});
const authMiddleware=require('../auth/auth');
const chatController=require('../controllers/chat');


//storing chats into DB
route.post('/post-chat',authMiddleware.authenticate, chatController.postChat);

//getting chats from DB
route.get('/get-chats',authMiddleware.authenticate,chatController.getChats);

//posting files thorugh multer
route.post('/upload', authMiddleware.authenticate, upload.single('image'), chatController.uploadFile);

module.exports=route;