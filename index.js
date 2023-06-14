const express = require('express');

const app = express();

const cors = require('cors');

require('dotenv').config();

const { MongoClient } = require('mongodb');

const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors({ origin: true }));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.boe0w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        console.log('connected to database')

        const database = client.db("codingLights");

        const productCollection = database.collection("products");

        const orderCollection = database.collection("orders");

        const userCollection = database.collection("users");

        const reviewCollection = database.collection("reviews");

        //basic server checking 

        app.get('/', async (req, res) => {
            res.send('Hello From Server')
        })
        //get all product
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});

            const products = await cursor.toArray();

            res.send(products);
        })
        //get all orders
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});

            const orders = await cursor.toArray();

            res.send(orders);
        })
        //get all review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});

            const reviews = await cursor.toArray();

            res.send(reviews);
        })
        //admin role get api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = 'user';
            if (user?.role === 'admin') {
                isAdmin = 'admin';
            }
            else if (user?.role === 'user') {
                isAdmin = 'user';
            }

            res.json({ admin: isAdmin });
        })
        //Single Product Get Api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query)
            res.send(product);
        })

        //Filtered Order Get Api

        app.post('/filtered', async (req, res) => {

            const filteredUserEmail = req.body.email;
            console.log(filteredUserEmail);
            const query = { email: filteredUserEmail };
            const orders = orderCollection.find(query)
            const ordersArray = await orders.toArray();
            res.send(ordersArray);
            console.log(await orders.count())
        })
        //Product POST API
        app.post('/products', async (req, res) => {
            const service = req.body;
            console.log('post hitted', service);

            const result = await productCollection.insertOne(service);

            console.log(result);
            res.json(result);
        })

        //Order POST API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            // console.log('post hitted', service);
            order.status = 'pending';
            console.log(order);
            const result = await orderCollection.insertOne(order);

            console.log(result);
            res.json(result);
        })
        //Review POST API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log('post hitted', service);
            // order.status = 'pending';
            // console.log(order);
            const result = await reviewCollection.insertOne(review);

            console.log(result);
            res.json(result);
        })
        //user api post 
        app.post('/users', async (req, res) => {
            const user = req.body;
            user.role = 'user';
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        //order delete api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
        //product delete api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })
        //order update/put function
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            // const newOrderStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'shipped'

                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            console.log('will be updating', id, result, updateDoc)
            res.json(result);
        })

        //google sign in user update/put function
        app.put('/users', async (req, res) => {
            const user = req.body;
            user.role = 'user';
            console.log(user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);


        })

    }
    finally {

    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log('listening to port: ', port);
})