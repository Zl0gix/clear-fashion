// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};

// inititiqte selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand = document.querySelector('#brand-select');
const buttonPrice = document.querySelector('#price-button');
const buttonRecently = document.querySelector('#recent-button');


/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const filterProducts = products => {
  let toDisplay = [...products];
  toDisplay = filterByBrands(products);
  
  if (buttonRecently.checked){
    toDisplay = filterByRecent(toDisplay);
  }

  if (buttonPrice.checked){
    toDisplay = filterByPrice(toDisplay);
  }
  return toDisplay;
}

const filterByBrands = products => products.filter(product => selectBrand.value!="all"? product.brand == selectBrand.value : true);

const filterByRecent = products => products.filter(product => (new Date().setHours(0, 0, 0, 0) - new Date(product.released.split('-')).getTime()) > 1209600000);

const filterByPrice = products => products.filter(product => product.price < 50);

const setFilterOptions = () => {
  selectBrand.length = 0;
  selectBrand[0] = new Option("all");
  [...new Set(currentProducts.map(product => product.brand))].forEach(brand => selectBrand[selectBrand.length] = new Option(brand));
  buttonPrice.checked = false;
  buttonRecently.checked = false;
}

const render = (products, pagination) => {
  let productsToDisplay = filterProducts(products);
  renderProducts(productsToDisplay);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(setFilterOptions())
    .then(() => render(currentProducts, currentPagination));
});

selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value), currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(setFilterOptions())
    .then(() => render(currentProducts, currentPagination));
});

selectBrand.addEventListener('change', event => {
  render(currentProducts, currentPagination)
});

buttonRecently.addEventListener('change', () => {
  render(currentProducts, currentPagination)
});

buttonPrice.addEventListener('change', () => {
  render(currentProducts, currentPagination)
});

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(setFilterOptions)
    .then(() => render(currentProducts, currentPagination))
);
