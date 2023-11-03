const Expense=require('../models/expense');

const addExpense=  async(req,res,next)=>{
    try{
      if(!req.body.category){
        throw new Error('Category is mandatory')
      }
    const expense=req.body.expense;
    const desc=req.body.desc;
    const category=req.body.category;
  
    const data= await Expense.create({expense:expense,desc:desc,category:category})
    res.status(201).json({newExpenseDetail: data});
    }catch(err){
      res.status(500).json({
        error: err
      })
    }
  }


const getExpense= async(req,res,next)=>{
    try{
      const expenses = await Expense.findAll();
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