const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('../models/user');

function generateAccessToken(id) {
    return jwt.sign(id, process.env.TOKEN_SECRET);
}

exports.signup = (req, res) => {
    const { name, email, phone, password } = req.body;

    User.findAll({ where: {email} })
        .then((user) => {
            if (user.length > 0) {
                return res.status(403).json({ success: false, message: 'email already exits' });
            }

            const saltRounds = 10;
            bycrypt.genSalt(saltRounds, function (err, salt) {
                bycrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        console.log(err);
                    }
                    User.create({ name, email, phone, password: hash })
                        .then(() => {
                            res.status(201).json({ success: true, message: 'user created successfully' });
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                })
            });
        }).catch(err=>console.log(err))
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    User.findAll({ where: { email: email } })
        .then(user => {
            if (user.length > 0) {
                bycrypt.compare(password, user[0].password, function (err, response) {
                    if (err) {
                        console.log(err);
                    }
                    if (response) {
                        console.log(JSON.stringify(user));
                        const jwtToken = generateAccessToken(user[0].id);
                        res.status(200).json({ token: jwtToken, userId: user[0].id, name: user[0].name, success: true, message: 'successfully logged in' });
                    }
                    else {
                        return res.status(401).json({ success: false, message: 'password do not match' });
                    }
                })
            } else {
                return res.status(404).json({ success: false, message: 'user does not exist' });
            }
        }).catch(err=>{
            console.log(err);
        })
}



