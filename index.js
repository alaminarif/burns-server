const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2iicl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt veriy
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const purchaseCollection = client.db("burns").collection("purchase");
    const reviewCollection = client.db("burns").collection("review");
    const oderCollection = client.db("burns").collection("oder");
    const usersCollection = client.db("burns").collection("users");

    // Purchase load
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

    // Purchase add
    app.post("/purchase", async (req, res) => {
      const item = req.body;
      const result = purchaseCollection.insertOne(item);
      res.send(result);
    });

    // purchase delete
    app.delete("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.send(result);
    });

    // all oder load
    app.get("/alloder", async (req, res) => {
      const query = {};
      const oder = await oderCollection.find(query).toArray();
      res.send(oder);
    });

    // oder load
    app.get("/oder", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const oder = await oderCollection.find(query).toArray();
      res.send(oder);
    });

    // place oder
    app.post("/oder", async (req, res) => {
      const item = req.body;
      const result = oderCollection.insertOne(item);
      res.send(result);
    });

    // oder delete
    app.delete("/oder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await oderCollection.deleteOne(query);
      res.send(result);
    });

    // Review load
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

    // all user load
    app.get("/user", verifyJWT, async (req, res) => {
      const query = {};
      const user = await usersCollection.find(query).toArray();
      res.send(user);
    });

    // users update
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const result = await usersCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });
      res.send({ result, token });
    });

    // user delete
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // my profile
    app.get("/myprofile", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    app.put("/myprofile", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log(user);
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // addmin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    //  make admin
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await usersCollection.findOne({ email: requester });

      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };

        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden" });
      }
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
