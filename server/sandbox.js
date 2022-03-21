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

async function sandbox (eshop, args) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop.brand} source`);
    let products = [];
    if (args.page >= 2) {
      for (let i = 0; i < page; i++) {
        products = products.concat(await brands[eshop.brand].scrape(eshop.url + "?p=" + args.page, eshop.brand));
      }
    }
    else {
      products = await brands[eshop.brand].scrape(eshop.url, eshop.brand);
    }
    console.log(products[0]);
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
  let args = {
    "page": 0
  }
  switch (b.brand) {
    case "DEDICATED":
      await sandbox(b, args);
      break;
    case "Montlimart":
      await sandbox(b, args);
      break;
    case "ADRESSE Paris":
      await sandbox(b, args);
      break;
  }
  
})
