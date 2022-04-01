// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentProductsToDisplay = [];
let currentPagination = {};
let favorites = []

// instantiate selectors
const buttonRefresh = document.querySelector('#refresh-button');
const labelRefresh = document.querySelector('#refresh-label');
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const sectioncurrentProduct = document.querySelector('#currentProduct');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbDisplayedProducts = document.querySelector('#nbDisplayedProducts');
const spanNbNewDisplayedProducts = document.querySelector('#nbNewDisplayedProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
const spanLastDate = document.querySelector('#lastDate');
const selectBrand = document.querySelector('#brand-select');
const buttonPrice = document.querySelector('#price-button');
const buttonRecently = document.querySelector('#recent-button');
const selectSortOption = document.querySelector('#sort-select');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({ result, meta }) => {
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
      `https://clear-fashion-sable.vercel.app/all_products?page=${page}&size=${size}`,
      {
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin"
      }
    );
    const body = await response.json();
    console.log(body);
    if (body.success !== true) {
      console.error(body);
      return { currentProducts, currentPagination };
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return { currentProducts, currentPagination };
  }
};

const renderCurrentProduct = product => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = `
      <div class="product card" id=${product._id}>
        <img class="card-img-top" src="${product.image}" alt="image of the product">
        <div class="card-body">
          <h5 class="card-title"><i>${product.brand}</i> : <u>${product.name}</u><h5>
          <p class="card-text">Prix : ${product.price}€<br>Date de scrapping : ${product.date}</p>
          <a class="btn btn-primary" href="${product.url}" target="_blank">See the product</a>
        </div>
      </div>
    `;

  div.innerHTML = template;
  fragment.appendChild(div);
  sectioncurrentProduct.innerHTML = '<h2>Current product</h2>';
  sectioncurrentProduct.appendChild(fragment);
}

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
      <div class="product" id=${product._id}>
        <input type="radio" id="radio-${product._id}" name="product-selector" value=${product._id}>
        <span>${product.brand}</span>
        <a>${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
  if (document.querySelector('input[name="product-selector"]')) {
    document.querySelectorAll('input[name="product-selector"]').forEach((elem) => {
      elem.addEventListener("change", event => {
        renderCurrentProduct(products.find(p => p._id == event.target.value));
      });
    });
  }
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const { currentPage, pageCount } = pagination;
  const options = Array.from(
    { 'length': pageCount },
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
  const { count } = pagination;

  spanNbProducts.innerHTML = count;
  spanNbDisplayedProducts.innerHTML = currentProductsToDisplay.length;
  let newProductsCount = 0;
  currentProductsToDisplay.forEach(product => {
    if ((new Date().setHours(0, 0, 0, 0) - new Date(product.date.split('-')).getTime()) > 1209600000) {
      newProductsCount++;
    }
  });
  spanNbNewDisplayedProducts.innerHTML = newProductsCount;
  if (currentProductsToDisplay.length >= 1) {
    let temp = [...currentProductsToDisplay];
    temp.sort((a, b) => a.price - b.price);
    spanP50.innerHTML = temp[Math.floor(temp.length * (1 - 0.5))].price;
    spanP90.innerHTML = temp[Math.floor(temp.length * (1 - 0.9))].price;
    spanP95.innerHTML = temp[Math.floor(temp.length * (1 - 0.95))].price;
    temp.sort((a, b) => new Date(a.date.split('-')) - new Date(b.date.split('-')));
    spanLastDate.innerHTML = temp[temp.length - 1].date;
  } else {
    spanP50.innerHTML = "undefined";
    spanP90.innerHTML = "undefined";
    spanP95.innerHTML = "undefined";
    spanLastDate.innerHTML = "undefined";
  }
};

const filterProducts = products => {
  currentProductsToDisplay = [...products];
  currentProductsToDisplay = filterByBrands(products);

  if (buttonRecently.checked) {
    currentProductsToDisplay = filterByRecent(currentProductsToDisplay);
  }

  if (buttonPrice.checked) {
    currentProductsToDisplay = filterByPrice(currentProductsToDisplay);
  }
}

const filterByBrands = products => products.filter(product => selectBrand.value != "all" ? product.brand == selectBrand.value : true);

const filterByRecent = products => products.filter(product => (new Date().setHours(0, 0, 0, 0) - new Date(product.date.split('-')).getTime()) > 1209600000);

const filterByPrice = products => products.filter(product => product.price < 50);

const setFilterOptions = () => {
  selectBrand.length = 0;
  selectBrand[0] = new Option("all");
  [...new Set(currentProducts.map(product => product.brand))].forEach(brand => selectBrand[selectBrand.length] = new Option(brand));
  buttonPrice.checked = false;
  buttonRecently.checked = false;
}

const sortProducts = products => {
  switch (selectSortOption.value) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;

    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;

    case "date-asc":
      products.sort((a, b) => new Date(a.date.split('-')) - new Date(b.date.split('-')));
      break;

    case "date-desc":
      products.sort((a, b) => new Date(b.date.split('-')) - new Date(a.date.split('-')));
      break;
  }
}

const render = (products, pagination) => {
  filterProducts(products);
  sortProducts(currentProductsToDisplay)
  renderProducts(currentProductsToDisplay);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */

buttonRefresh.addEventListener('click', async () => {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://clear-fashion-sable.vercel.app/products", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Access-Control-Allow-Origin', "*");
  xhr.onreadystatechange = () => {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      labelRefresh.innerHTML = this.responseText;
      setTimeout(() => {
        labelRefresh.innerHTML = "";
      }, 5000);
    }
  }
  xhr.send(JSON.stringify({
    method: "upsert"
  }));
  // TODO : REPAIR CORS POLICY BULLSHIT
})

selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value))
  setCurrentProducts(products)
  setFilterOptions()
  render(currentProducts, currentPagination);
});

selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value), currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(setFilterOptions())
    .then(() => render(currentProducts, currentPagination));
});

selectBrand.addEventListener('change', () => {
  render(currentProducts, currentPagination)
});

buttonRecently.addEventListener('change', () => {
  render(currentProducts, currentPagination)
});

buttonPrice.addEventListener('change', () => {
  render(currentProducts, currentPagination)
});

selectSortOption.addEventListener('change', () => {
  render(currentProducts, currentPagination)
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  setCurrentProducts(products);
  setFilterOptions();
  render(currentProducts, currentPagination)
});
