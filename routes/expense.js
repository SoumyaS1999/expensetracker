const express = require('express');

const router= express.Router();

const usercontroller= require('../controller/expense');

router.post('/add-expense',usercontroller.addExpense);

router.get('/get-expense',usercontroller.getExpense);

router.delete('/delete-expense/:id',usercontroller.deleteExpense);

module.exports= router;