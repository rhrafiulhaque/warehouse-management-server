const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewire
app.use(cors());
app.use(express.json());


// Verify JWT 
function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'Unauthorized Access By Someone'});
    }
    next();
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpofv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run= async()=>{
    try {
        await client.connect();
        const productCollection = client.db('electroMart').collection('products');
        const reviewCollection = client.db('electroMart').collection('review');

        // All Product 
        app.get('/products', async(req,res)=>{
            const query={};
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
        });


        // All Review 
        app.get('/review', async(req,res)=>{
        const query={};
        const cursor = reviewCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
        });

        // Add Product 

        app.post('/addproduct',async(req,res)=>{
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // Get Product By ID 
        app.get('/product/:id',async(req,res)=>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        // Update Product
        app.put('/product/:id',async(req,res)=>{
            const id =req.params.id;
            const updateQuantity = req.body; 
            const filter = {_id:ObjectId(id)};
            const options ={upsert:true};
            const updateDoc ={
                $set: {
                    quantity:updateQuantity.quantity
                }
            };
            const result = await productCollection.updateOne(filter,updateDoc,options);
            res.send(result);

        })

        // Update Product Delivery 
        app.put('/productdelivery/:id',async(req,res)=>{
            const id =req.params.id;
            const deleveredQuan = req.body; 
            const filter = {_id:ObjectId(id)};
            const options ={upsert:true};
            const updateDoc ={
                $set: {
                    quantity:deleveredQuan.delivered-1
                }
            };
            const result = await productCollection.updateOne(filter,updateDoc,options);
            res.send(result);

        })

        // DELETE Product 
        app.delete('/product/:id',async(req,res)=>{
            const id = req.params.id;
            const query={_id:ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // Product Collection By Email 
        app.get('/myitem', verifyJWT, async(req,res)=>{
            
            const email = req.query.email;
            const query ={email:email};
            const cursor = productCollection.find(query);
            const myitem = await cursor.toArray();
            res.send(myitem);
        })

        // AUTH BY JWT 
        app.post('/login', async(req,res)=>{
            const user = req.body;
            const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
                expiresIn:'1d'
            });
            res.send(accessToken);
        })


    }
    finally{

    }
}
run().catch(console.dir);






app.get('/',(req,res)=>{
    res.send('Node Surver Running')
});

app.listen(port,()=>{
    console.log('Listening to port',port);
})