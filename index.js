const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2iicl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const purchaseCollection = client.db("burns").collection("purchase");
    const reviewCollection = client.db("burns").collection("review");
    const oderCollection = client.db("burns").collection("oder");
    // Purchase
    app.get("/purchase", async (req, res) => {
      const query = {};
      const cursor = purchaseCollection.find(query);
      const purchase = await cursor.toArray();
      res.send(purchase);
    });
    // purchase Details
    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const purchase = await purchaseCollection.findOne(query);
      res.send(purchase);
    });
    // place oder
    app.post("/oder", async (req, res) => {
      const item = req.body;
      const result = oderCollection.insertOne(item);
      res.send(result);
    });
    // Review
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });
    // Add Review
    app.post("/myreview", async (req, res) => {
      const item = req.body;
      const result = await reviewCollection.insertOne(item);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Burns running");
});

app.listen(port, () => {
  console.log("assigment-12 connect port:", port);
});
// project end
