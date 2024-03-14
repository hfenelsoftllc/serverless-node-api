const serverless = require("serverless-http");
const express = require("express");
const AWS = require("aws-sdk")
const {neon, neonConfig} = require("@neondatabase/serverless");

const AWS_REGION ="us-east-1"
const STAGE = process.env.STAGE || 'prod'

const app = express();

const ssm = new AWS.SSM({region: AWS_REGION})

const DATABASE_URL_SSM_PARAM =`/serverless-node-api/${STAGE}/prod/database-url`

async function dbClient(){
  //for http connections
  // non pooling
  const paramStoreData = await ssm.getParameter({
    Name: DATABASE_URL_SSM_PARAM,
    WithDecryption: true
  }).promise()

  neonConfig.fetchConnectionCache = true
  const sql = neon(paramStoreData.Parameter.Value);
  return sql
}


app.get("/", async(req, res, next) => {
  console.log(process.env.DEBUG)
  const sql = await dbClient()
  const [results] = await sql`select now();`
  return res.status(200).json({
    message: "Hello from root!",
    results: results.now,
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
