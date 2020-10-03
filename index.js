var express= require('express');
var app=express();

//connecting server file 
let server=require('./server');
let middleware=require('./middleware');

//body parser
const bodyparser=require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='VentilatorAvailabity';
let db
MongoClient.connect(url,{useUnifiedTopology:true}, (err,client)=>{
if(err) return console.log(err);
db=client.db(dbName);
console.log(`Connected Database: ${url}`);
console.log(`Database : ${dbName}`);
});

//fetching hospital details
app.get('/getHospitalDetails',middleware.checkToken,function(req,res){
    console.log('Fetching data from hospital collection');
    var data=db.collection('hospital').find().toArray().then(result=>res.json(result));
});

//fetching ventillator details
app.get('/getVentilaorDetails',middleware.checkToken,function(req,res){
    console.log('fetching data from ventilator collection');
    var data=db.collection('ventilator').find().toArray().then(result=>res.json(result));
}); 

//search ventilators by details
app.post('/serachVbystatus',middleware.checkToken,function(req,res){
    var s=req.body.status;
    console.log(s);
    var ventdetails=db.collection('ventilator').find({"status":s}).toArray().then(function(result){res.json(result)});
});

//search ventilator by hospital name
app.post('/searchVbyname',middleware.checkToken,(req,res)=>{
    var n=req.query.Name;
    console.log(n);
    var ventdetails=db.collection('ventilator')
    .find({'Name':new RegExp(n,'i')}).toArray().then(result=>res.json(result));
});

//search hospital by name
app.post('/searchHospital',middleware.checkToken,(req,res)=>{
    var n=req.body.Name;
    console.log(n);
    var HospitalDetails=db.collection('hospital').find({'Name':new RegExp(n,'i')}).toArray().then(result=>res.json(result));
});

//update ventilator details
app.put('/updateVent',middleware.checkToken,(req,res)=>{
    var ventId={vId:req.body.vId};
    console.log(ventId);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilator").updateOne(ventId,newvalues,function(err,result){
        res.json("ventilator status updated");
        if(err) throw err;
    });
});

//add ventilator
app.post('/addventilator',middleware.checkToken,(req,res)=>{
    var h=req.body.hId;
    var v=req.body.vId;
    var s=req.body.status;
    var n=req.body.Name;
    var item={
        hId:h,vId:v,status:s,Name:n
    };
    db.collection('ventilator').insertOne(item,function(err,result){
        res.json('ventilator inserted!');
    });
});

//delete ventilator
app.delete('/deleteVentilator',middleware.checkToken,(req,res)=>{
    var v=req.body.vId;
    console.log(v);
    var v1={vId:v};
    db.collection('ventilator').deleteOne(v1,function(err,result){
        if(err) throw err;
        res.json("ventilator deleted");
    });
});app.listen(1111);