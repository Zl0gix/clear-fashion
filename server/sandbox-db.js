/* eslint-disable no-console, no-process-exit */
const db = require('./db');
const sandbox = require('./sandbox')
const brandsList = require('./brands.json')
const fs = require('fs');

async function sandboxDB () {
  try {

    //insert_in_db();

    console.log('\n');

    console.log('💽  Find DEDICATED products only');

    const DEDICATEDOnly = await db.find({'brand': 'DEDICATED'});
    const lessThan40 = await db.find({'price': { '$lt': 40}});
    const allProductsOrdered1 = await db.aggregate([{"$sort": {'price' : 1}}]);
    const allProductsOrdered2 = await db.find({}, {'price' : 1});

    console.log(`👕 ${DEDICATEDOnly.length} total of products found for DEDICATED`);
    console.log(DEDICATEDOnly[0]);

    console.log(`👕 ${lessThan40.length} total of products found with price < 40`);
    console.log(lessThan40[0]);

    console.log(`👕 ${allProductsOrdered1.length} total of products found`);
    console.log(allProductsOrdered1.slice(0, 5));

    console.log(`👕 ${allProductsOrdered2.length} total of products found`);
    console.log(allProductsOrdered2.slice(0, 5));

    db.close();
  } catch (e) {
    console.error(e);
  }
}

async function insert_in_db() {
  let temp_products = brandsList.map(eshop => JSON.parse(fs.readFileSync(`LocalData/${eshop.brand.replace(" ", "_")}.json`)));
  const products = (await Promise.all(temp_products)).flat();

  console.log('\n');

  console.log(`👕 ${products.length} total of products found`);
  
  console.log('\n');

  const result = await db.insert(products);

  console.log(`💽  ${result.insertedCount} inserted products`);
}

sandboxDB();
