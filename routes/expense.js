const express = require('express');

const router= express.Router();

const usercontroller= require('../controller/expense');
const userauthentication = require('../middleware/auth')

router.post('/add-expense',userauthentication.authenticate ,usercontroller.addExpense);

router.get('/download', userauthentication.authenticate, usercontroller.downloadExpenses);

router.get('/get-expense',userauthentication.authenticate ,usercontroller.getExpense);

router.delete('/delete-expense/:id',usercontroller.deleteExpense);

module.exports= router;