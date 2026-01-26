const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// user: srkhaddoDB
// Password: vzVY4ZkZjfe72YPn

const uri = "mongodb+srv://srkhaddoDB:vzVY4ZkZjfe72YPn@cluster0.vefjkrb.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const clientsCollection = client.db('clientsdb').collection('clients');

        // bakir list read kora
        app.get('/clients', async (req, res) => {
            const cursor = clientsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // bakir statement read kora
        app.get('/clients/:id', async (req, res) => {
            const id = req.params.id;

            const client = await clientsCollection.findOne({
                _id: new ObjectId(id)
            });

            res.send(client);
        });

        // baki name list add kora function
        app.post('/clients', async (req, res) => {
            console.log('data in the server', req.body);
            const newClient = req.body;
            const result = await clientsCollection.insertOne(newClient);
            res.send(result)
        })

        // Bakir name list update kora function
        app.put('/clients/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedClient = req.body;

                const updateDoc = {
                    $set: {
                        name: updatedClient.name,
                        location: updatedClient.location,
                        number: updatedClient.number,
                    },
                };

                const result = await clientsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    updateDoc
                );

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Client update failed" });
            }
        });

        // bakir name list delete kora
        app.delete('/clients/:id', async (req, res) => {
            try {
                const id = req.params.id;

                const result = await clientsCollection.deleteOne({
                    _id: new ObjectId(id)
                });

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Client delete failed" });
            }
        });


        // bakir statement add kora
        app.post('/clients/:id/transactions', async (req, res) => {
            try {
                const clientId = req.params.id;
                const transaction = req.body;

                const result = await clientsCollection.updateOne(
                    { _id: new ObjectId(clientId) },
                    { $push: { transactions: transaction } }
                );

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Transaction add failed" });
            }
        });

        // baki statement update korar

        // PUT /clients/:id/transactions/:transactionId
        app.put('/clients/:id/transactions/:transactionId', async (req, res) => {
            try {
                const clientId = req.params.id; // MongoDB ObjectId ok
                const transactionId = req.params.transactionId; // UUID string
                const updatedTransaction = req.body;

                const result = await clientsCollection.updateOne(
                    { _id: new ObjectId(clientId), "transactions._id": transactionId }, // UUID string
                    { $set: { "transactions.$": updatedTransaction } }
                );

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Transaction update failed" });
            }
        });

        // DELETE /clients/:id/transactions/:transactionId
        app.delete('/clients/:id/transactions/:transactionId', async (req, res) => {
            try {
                const clientId = req.params.id;           // Client ObjectId
                const transactionId = req.params.transactionId; // UUID string (jodi frontend e UUID use kora hoy)

                const result = await clientsCollection.updateOne(
                    { _id: new ObjectId(clientId) },
                    { $pull: { transactions: { _id: transactionId } } } // match specific transaction
                );

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Transaction delete failed" });
            }
        });



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('simple sr khaddo running..');
})

app.listen(port, () => {
    console.log(`sr khaddo vander running port ${port}`);
})