const Expense=require('../models/expense');
const User = require('../models/users');
const seqeulize= require('../util/database');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');

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

  const downloadExpenses =  async (req, res) => {

    try {
        if(!req.user.ispremiumuser){
            return res.status(401).json({ success: false, message: 'User is not a premium User'})
        }
        const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING; // check this in the task. I have put mine. Never push it to github.
        // Create the BlobServiceClient object which will be used to create a container client
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

        // V.V.V.Imp - Guys Create a unique name for the container
        // Name them your "mailidexpensetracker" as there are other people also using the same storage

        const containerName = 'prasadyash549yahooexpensetracker'; //this needs to be unique name

        console.log('\nCreating container...');
        console.log('\t', containerName);

        // Get a reference to a container
        const containerClient = await blobServiceClient.getContainerClient(containerName);

        //check whether the container already exists or not
        if(!containerClient.exists()){
            // Create the container if the container doesnt exist
            const createContainerResponse = await containerClient.create({ access: 'container'});
            console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
        }
        // Create a unique name for the blob
        const blobName = 'expenses' + uuidv1() + '.txt';

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        console.log('\nUploading to Azure storage as blob:\n\t', blobName);

        // Upload data to the blob as a string
        const data =  JSON.stringify(await req.user.getExpenses());

        const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
        console.log("Blob was uploaded successfully. requestId: ", JSON.stringify(uploadBlobResponse));

        //We send the fileUrl so that the in the frontend we can do a click on this url and download the file
        const fileUrl = `https://demostoragesharpener.blob.core.windows.net/${containerName}/${blobName}`;
        res.status(201).json({ fileUrl, success: true}); // Set disposition and send it.
    } catch(err) {
        res.status(500).json({ error: err, success: false, message: 'Something went wrong'})
    }

};

module.exports={
    addExpense,
    getExpense,
    deleteExpense,
    downloadExpenses};