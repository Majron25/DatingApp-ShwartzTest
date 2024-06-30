import http from "http";
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql";

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "3MB" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "YOUR PASSWORD HERE",
  database: "dating_app_db",
});

connection.connect((err) => {
  if (err) {
    return console.log("error:" + err.message);
  }
  console.log("Connected to the MySQL database!");
});

app.post("/CreateAccountGender", (req, res) => {
  const { email, password, gender, sexualPreference } = req.body;

  const user = {
    email: email,
    password: password,
  };

  console.log(user);

  const query = connection.query(
    "INSERT INTO user SET ?",
    user,
    (err, result) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Failed to insert data into the database" });
      } else {
        console.log("Successfully inserted!");
        res.json({ status: 200, error: null, response: result });
      }
    }
  );
});

app.get("/", (req, res) => {
  res.send("hello there");
});

app.use(express.static("public"));

const server = http.Server(app);
const port = 3000;

server.listen(port, () =>
  console.log(
    `server.js, process id: ${process.pid}, listening on port: ${port}`
  )
);
