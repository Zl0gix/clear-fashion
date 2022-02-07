/* eslint-disable no-console, no-process-exit */
const fs = require('fs')

const dedicatedbrand = require('./sources/dedicatedbrand');
const montlimartbrand = require('./sources/montlimartbrand');
const adressebrand = require('./sources/adressebrand')

const brands = {
  "DEDICATED": dedicatedbrand,
  "Montlimart": montlimartbrand,
  "ADRESSE Paris" : adressebrand
}

const brandsList = require('./brands.json')

async function sandbox (eshop, page=0) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop.brand} source`);
    let products = [];
    if (page >= 2) {
      for (let i = 0; i < page; i++) {
        products = products.concat(await brands[eshop.brand].scrape(eshop.url + "?p=" + page));
      }
    }
    else {
      products = await brands[eshop.brand].scrape(eshop.url);
    }
    console.log(products);
    fs.writeFile(`${process.cwd()}/LocalData/${eshop.brand.replace(" ", "_")}.json`, JSON.stringify(products), err => {
      if (err) {
        console.error(err);
        return
      }
    });
    console.log('done');
  } catch (e) {
    console.error(e);
  }
}

const [,, eshop] = process.argv;

const folderName = process.cwd() + "/LocalData"

try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName)
  }
} catch (err) {
  console.error(err)
}

brandsList.forEach(async (b) => {
  console.log("Brand :");
  console.log(b);
  await sandbox(b);
})
