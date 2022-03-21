const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @param  {String} brand - current brand
 * @return {Array} products
 */
const parse = (data, brand) => {
    const $ = cheerio.load(data);

    return $('.product-container')
        .map((i, element) => {
            const name = $(element)
                .find('.product-name')
                .attr('title');

            const price = parseInt(
                $(element)
                    .find('.prixright')
                    .text()
            );

            const url = $(element)
                .find('.product-name')
                .attr('href');

            const image = $(element)
                .find(".product_img_link")
                .children('img')
                .eq(0)
                .attr('data-original')

            return { name, price, url, image, brand };
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

            return parse(body, brand);
        }

        console.error(response);

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};