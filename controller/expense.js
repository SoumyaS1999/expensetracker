const Expense=require('../models/expense');
const User = require('../models/users');
const seqeulize= require('../util/database');
const AWS= require('aws-sdk');

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

  function uploadToS3(data,filename){
    const BUCKET_NAME='expensetrackingapp1999';
    const IAM_USER_KEY='AKIARQLLWROJ23V4EPOF';
    const IAM_USER_SECRET='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';

    let s3bucket= AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET
    })

  s3bucket.createBucket(()=>{
    var params= {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data
    }

    s3bucket.upload(params,(err,s3response)=>{
      if(err){
        console.log('Something Went Wrong',err)
      }
      else{
        console.log('success',s3response);
      }
    })
  })

  }


  const downloadExpenses =  async (req, res) => {
    const expenses = req.user.expense;
    console.log(expenses);
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename ='Expense.txt';
    const fileURL = uploadToS3(stringifiedExpenses,filename);
    res.status(200).json({fileURL, success: true})

};

module.exports={
    addExpense,
    getExpense,
    deleteExpense,
    downloadExpenses};