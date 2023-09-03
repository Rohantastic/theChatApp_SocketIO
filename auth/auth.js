const jwt = require('jsonwebtoken');
const User = require('../models/user');


exports.authenticate = async (req,res,next)=>{
    try{
        const token = req.headers['authorization'];

        if(typeof token != 'undefined'){
            const isUserTrue = token.split(' ');
            const userToken = isUserTrue[1];
            const userId = Number(jwt.verify(userToken,process.env.TOKEN_SECRET));
            const user = await User.findByPk(userId);
            req.user = user;
            next();
        }
    }catch(err){
        console.log(err);
        res.status(401);
    }
}