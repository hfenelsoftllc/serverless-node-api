const serverless = require("serverless-http");
const express = require("express");
import {neon} from '@neondatabase/serverless';

const app = express();

function dbClient(){
  const sql = neon(process.env.DATABASE_URL);
  return sql
}

app.get("/", (req, res, next) => {
  const db = dbClient()
  const results = db`SELECT NOW();`
  return res.status(200).json({
    message: "Hello from root!",
    results: results,
  });
});

app.get("/path", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

//Server-full app
// app.listen(3000, ()=>{
//   console.log("running at http:/localhost:3000")
// })

module.exports.handler = serverless(app);
