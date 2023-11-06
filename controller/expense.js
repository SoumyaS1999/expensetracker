const Expense=require('../models/expense');
const User = require('../models/users');
const seqeulize= require('../util/database');

const addExpense=  async(req,res,next)=>{
    const t= await seqeulize.transaction();
    try{
      if(!req.body.category){
        throw new Error('Category is mandatory')
      }
    const expense=req.body.expense;
    const desc=req.body.desc;
    const category=req.body.category;

    if(expense== undefined || expense.length === 0 ){
      return res.status(400).json({success: false, message: 'Parameters missing'})
  }
  
    const data= await Expense.create({expense:expense,desc:desc,category:category, userId: req.user.id},{ transaction: t})
    const totalExpense= Number(req.user.totalExpenses) + Number(expense)

    await User.update({
      totalExpenses: totalExpense
    },{
      where: {id: req.user.id},
      transaction: t
    }
    )
      await t.commit();
      res.status(201).json({newExpenseDetail: data});
      
    }catch(err){
      await t.rollback();
      res.status(500).json({
       success: false,  error: err
      })
    }
  }


const getExpense= async(req,res,next)=>{
    try{
      const expenses = await Expense.findAll({ where : { userId: req.user.id}});
      res.status(200).json({allExpenses:expenses});
    }catch(error){
      console.log('Get expense is failing',JSON.stringify(error))
      res.status(500).json({error: error})
    }
  }

const deleteExpense= async(req,res)=>{
    try{
      if(req.params.id=='undefined'){
        console.log('ID is missing')
        return res.status(400).json({err:'ID is missing'})
      }
    const eId=req.params.id;
    await Expense.destroy({where:{id: eId}});
    res.sendStatus(200);
    }catch(err){
      console.log(err);
      res.status(500).json(err)
    }
  }

module.exports={
    addExpense,
    getExpense,
    deleteExpense};