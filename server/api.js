const cors = require('cors');
const { response } = require('express');
const express = require('express');
const helmet = require('helmet');
const db = require('./db');
const brandsList = require('./brands.json')
const fs = require('fs');
const sandbox = require('./sandbox');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.post('/products', async (request, response) => {
  console.log("POST /products");
  console.log(request.body);
  if (request.body.method == 'upsert'){
    await sandbox.writeAllToFile();
    let temp_products = brandsList.map(eshop => JSON.parse(fs.readFileSync(`LocalData/${eshop.brand.replace(" ", "_")}.json`)));
    const products = (await Promise.all(temp_products)).flat();
    const count = await db.upsert(products);
    response.send(`Updated ${count} products on ${products.length} scrapped products`);
    return
  }
  response.send("Unkown method");
})

app.get('/all_products', async (request, response) => {
  console.log("GET /all_products");
  console.log(request.query);

  const PAGE = (request.query.page != undefined) && (request.query.page != "0")? parseInt(request.query.page) : 1;
  const SIZE = request.query.size != undefined? parseInt(SIZE) : 12;

  let query = {};
  let options = {
    "limit": SIZE,
    "skip" : (PAGE-1)*options.limit
  }

  const results = await db.find(query, options);
  response.json({
    "data": {
      "meta": {
        "currentPage": PAGE,
        "pageSize": SIZE
      },
      "result": results
    },
    "success": true
  })
  //response.json({ query, options, "total" : results.length, results});
})

app.get('/products/search', async (request, response) => {
  console.log("GET /products/search");
  console.log(request.query);

  const LIMIT = request.query.limit;
  const BRAND = request.query.brand;
  const PRICE = request.query.price;

  let query = {};
  let options = {"limit": 12};
  if (LIMIT != undefined) {
    options.limit = parseInt(LIMIT)
  } 
  if (BRAND != undefined) {
    query.brand = BRAND;
  }
  if (PRICE != undefined) {
    query.price = {"$lte": parseFloat(PRICE)}
  }
  const results = await db.find(query, options);
  response.json({ query, options, "total" : results.length, results});
})

app.get('/products/:id', async (request, response) => {
  console.log("GET /products/:id");
  console.log(request.params)
  const result = await db.find({"_id" : request.params.id});
  response.json(result);
})

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
