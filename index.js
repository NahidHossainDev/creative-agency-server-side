const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("services"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b31bz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceListCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection(`${process.env.DB_COLL}`);
  const adminCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection(`admin`);
  const orderCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection(`order`);
  const reviewCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection(`review`);

  app.post("/addServices", (req, res) => {
    const file = req.files.file;
    const description = req.body.description;
    const title = req.body.title;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceListCollection
      .insertOne({ description, title, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/getServices", (req, res) => {
    serviceListCollection.find({}).toArray((err, document) => {
      res.send(document);
    });
  });

  app.post("/addAdmin", (req, res) => {
    adminCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/addOrder", (req, res) => {
    orderCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addReview", (req, res) => {
    reviewCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/checkAdmin", (req, res) => {
    adminCollection.find({ email: req.body.email }).toArray((err, document) => {
      res.send(document.length > 0);
    });
  });

  app.get("/getMyServices", (req, res) => {
    orderCollection
      .find({ email: req.query.email })
      .toArray((err, document) => {
        res.send(document);
      });
  });

  app.get("/showOrders", (req, res) => {
    orderCollection.find({}).toArray((err, document) => {
      res.send(document);
    });
  });

  app.get("/showReviews", (req, res) => {
    reviewCollection.find({}).toArray((err, document) => {
      res.send(document);
    });
  });
});

app.listen(8000);
