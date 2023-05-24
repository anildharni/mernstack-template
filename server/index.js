const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const port = 1337;

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/db-name-to-be-created", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to mongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to mongoDB: " + error);
  });

app.post("/api/register", async (req, res) => {
  console.log(req.body);
  try {
    const hashedPassword = bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "Duplicate email" });
  }
});

app.post("/api/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      res.json(error);
    }

    const isPasswordSame = bcrypt.compare(req.body.password, user.password);

    if (isPasswordSame) {
      const token = jwt.sign(
        {
          email: user.email,
          name: user.name,
        },
        "secret-phrase"
      );
      res.json({ status: "ok", user: token });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: false });
  }
});

app.get("/api/getEmails", async (req, res) => {
  try {
    const response = User.find({}, { email: 1 });
    console.log(response);
    res.json((await response).map((user) => user.email));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "emails not found" });
  }
});

app.post("/api/quotes", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.verify(token, "secret-phrase");
    const user = await User.updateOne(
      { email: decoded.email },
      { $set: { quote: req.body.quote } }
    );

    res.json({status:"ok"})
  } catch (error) {
    res.json({ status: "error" });
  }
});

app.get("/api/quotes", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.verify(token, "secret-phrase");
    const user = await User.find(
      { email: decoded.email }
    );

    res.json({status:"ok", quote: user.quote})
  } catch (error) {
    res.json({ status: "error" });
  }
});

app.listen(port, () => {
  console.log("server is initialised at port " + port);
});
