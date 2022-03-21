const fetch = require('node-fetch');
const cheerio = require('cheerio');
const crypto = require('crypto');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @param  {String} base_url - html response's url
 * @param  {String} brand - current brand
 * @return {Array} products
 */
const parse = (data, base_url, brand) => {
  const $ = cheerio.load(data);
  const hash = crypto.createHash('sha256');
  return $('.productList-container .productList')
    .map((i, element) => {
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.productList-price')
          .text()
      );
      const url = base_url + $(element)
        .find('.productList-link')
        .attr('href');
      const image = $(element)
        .find(".productList-image")
        .children('img')
        .eq(0)
        .attr('data-src');

      let _id;
      if (url == undefined){
          _id = undefined;
      } else {
          let tempHash = hash.copy();
          tempHash.update(url);
          _id = tempHash.digest("hex");
      }
      
      return {_id, name, price, url, image, brand};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @param  {String} brand - current brand
 * @return {Array|null}
 */
module.exports.scrape = async (url, brand) => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parse(body, url, brand);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
