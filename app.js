const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
// const chatRoutes = require('./routes/chat');
// const groupRoutes=require('./routes/group');
const User = require('./models/user');
// const Chat=require('./models/chat')
// const Group=require('./models/group');
// const UserGroup=require('./models/usergroup');
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/admin', userRoutes);
//app.use(chatRoutes);
//app.use(groupRoutes);

sequelize.sync();

app.listen(3000);
