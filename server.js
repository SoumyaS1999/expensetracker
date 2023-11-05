const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');


const sequelize = require('./util/database');

const User=require('./models/users.js');
const Expense=require('./models/expense.js');
const Order = require('./models/orders.js');



var cors=require('cors');

const app = express();

const dotenv = require('dotenv');

// get config vars
dotenv.config();


app.use(cors());

app.set('views', 'views');

const userRoutes=require('./routes/user');
const expenseRoutes=require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumFeatureRoutes = require('./routes/premiumFeature')


app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user',userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumFeatureRoutes);


User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);



sequelize
  .sync()
  .then(result => {
    // console.log(result);
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });