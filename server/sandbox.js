/* eslint-disable no-console, no-process-exit */
const fs = require('fs')

const dedicatedbrand = require('./sources/dedicatedbrand');
const montlimartbrand = require('./sources/montlimartbrand');
const adressebrand = require('./sources/adressebrand')

const brands = module.exports.brands = {
  "DEDICATED": dedicatedbrand,
  "Montlimart": montlimartbrand,
  "ADRESSE Paris" : adressebrand
}

const brandsList = require('./brands.json')

module.exports.getProducts = async function getProducts (eshop, args) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop.brand} source`);
    let products = [];
    if (args.page >= 2) {
      for (let i = 0; i < args.page; i++) {
        if (eshop.brand = "DEDICATED"){
          products = products.concat(await brands[eshop.brand].scrape(eshop.url + "#page=" + args.page, eshop.brand))
        } else if (eshop.brand = "Montlimart") {
          products = products.concat(await brands[eshop.brand].scrape(eshop.url + "?p=" + args.page, eshop.brand));
        }
      }
    }
    else {
      products = await brands[eshop.brand].scrape(eshop.url, eshop.brand);
    }
    const filtered_products = products.filter(p => p._id != undefined && p.name != undefined && p.price != undefined && p.url != undefined && p.image != undefined && p.brand != undefined);
    const uids = [...new Set(filtered_products.map(p => p._id))]
    const no_duplicates = uids.map(id => filtered_products.find(product => product._id === id))
    console.log(`Done browsing ${eshop.brand} source`);
    return no_duplicates
  } catch (e) {
    console.error(e);
  }
}

function checkFolders() {
  const folderName = process.cwd() + "/LocalData"

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName)
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports.writeToFile = async function writeToFile(eshop, args) {
  checkFolders();
  const products = await this.getProducts(eshop, args);
  console.log(`Writing ${eshop.brand} data to file`)
  fs.writeFile(`${process.cwd()}/LocalData/${eshop.brand.replace(" ", "_")}.json`, JSON.stringify(products), err => {
    if (err) {
      console.error(err);
      return
    }
  });
  console.log(`Done writing ${eshop.brand} data to file`)
}

module.exports.writeAllToFile = async function writeAllToFile() {
  checkFolders();
  
  brandsList.forEach(async (eshop) => {
    console.log("Brand :");
    console.log(eshop);
    switch (eshop.brand) {
      case "DEDICATED":
        this.writeToFile(eshop, { "page": 0 });
        break;
      case "Montlimart":
        this.writeToFile(eshop, { "page": 0 });
        break;
      case "ADRESSE Paris":
        this.writeToFile(eshop, { "page": 0 });
        break;
    }
  })
}