const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('app Running');
});

function verifyJwt(req, res, next) {
    const authHeder = req.headers.authorization;

    if (!authHeder) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeder.split(' ')[1];
    jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(409).send({ message: 'unauthorized access' });
        };
        req.decoded = decoded;
        next();

    })


}

// ==================================================================
// name: geniusCar
// password: R4RB8lQHHCwdJveS
// jwt key: 14681e121f01b2b7edccf23d5fb49ed0a078165a1cf0cdbee5594c29d2f039a17dfc03765d7d5c92cc9051c21e8d3fc5a194dd077aa79976072bf0625a5e0b96
// ==================================================================


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { json } = require('express');
const uri = "mongodb+srv://geniusCar:R4RB8lQHHCwdJveS@cluster0.blopt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const servicesCollection = client.db("geniusCar").collection("Services");
        const oderInfoCollection = client.db("geniusCar").collection("oderInfo");

        app.post('/jwt', (req, res) => {

            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: '10h' });
            res.send({ token });
        })

        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(filter);
            res.send(result);
        });

        app.post('/oderInfo', async (req, res) => {
            const oderInfo = req.body;
            const result = await oderInfoCollection.insertOne(oderInfo);
            res.send(result);
        });
        app.get('/orderInfo', verifyJwt, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'unauthorized access' });
            }
            let query = {};
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = oderInfoCollection.find(query);
            const result = await cursor.toArray();
            console.log(result)
            res.send(result);
        });
        app.delete('/orderDelete/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const result = await oderInfoCollection.deleteOne(filter);
            res.send(result);
        })

    }
    finally {

    }
};

run().catch(err => console.log(err));


// ==================================================================


app.listen(port, () => {
    console.log('app Running on port', port);
});
