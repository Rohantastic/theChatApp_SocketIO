const express=require('express');

const route=express.Router();

const authMiddleware=require('../auth/auth');
const groupController=require('../controllers/group');



//route to create a group
route.post('/create-group',authMiddleware.authenticate,groupController.createGroup);


//route to delete group
route.delete('/delete-group/:gId',authMiddleware.authenticate,groupController.deleteGroup);


//route to retrieve groups
route.get('/get-groups',authMiddleware.authenticate,groupController.getGroups);


//route to get list of all the users
route.get('/get-users', authMiddleware.authenticate,groupController.getUsers);


//route to add the user into the specific selected group
route.post('/add-user',authMiddleware.authenticate,groupController.addUserToGroup);


//route to make admin to the user
route.post('/make-admin', authMiddleware.authenticate, groupController.makeAdmin);


//route to remove specific user from group
route.post('/remove-user', authMiddleware.authenticate, groupController.removeUser);

module.exports=route;

