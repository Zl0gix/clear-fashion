/* eslint-disable no-console, no-process-exit */
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
    let products = []
    if (page >= 2) {
      for (let i = 0; i < page; i++) {
        products = products.concat(await brands[eshop.brand].scrape(eshop.url + "?p=" + page));
      }
    }
    else {
      products = await brands[eshop.brand].scrape(eshop.url);
    }
    console.log(products);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

brandsList.forEach(async (b) => {
  console.log("Brand :")
  console.log(b);
  await sandbox(b, 2);
})
