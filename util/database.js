const Sequelize = require('sequelize');


//database variable
const sequelize = new Sequelize('theChatApp','root',
'root',{
    dialect: 'mysql',
    host: 'localhost'
});


module.exports = sequelize;