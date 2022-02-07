/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sources/dedicatedbrand');
const montlimartbrand = require('./sources/montlimartbrand');
const brands = {
  "DEDICATED": dedicatedbrand,
  "Montlimart": montlimartbrand,
  //"ADRESSE Paris" : undefined
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


async function get_montlimar(url, pages) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);
    // for montlimart get "toute-la-collection.html" or "toute-la-collection.html?p=2", p=3, etc... find <ul class="products-grid products-grid--max-4-col products-grid-1"> or <ul class="products-grid products-grid--max-2-col products-grid-2"> and others, find by tag "product-grid-x"
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

brandsList.forEach(async (b) => {
  if (b.brand == "Montlimart") {
    console.log("Brand :")
    console.log(b);
    await sandbox(b, 2);
  }
})

//sandbox(eshop);
