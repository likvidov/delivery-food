'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPricetag = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');


let login = localStorage.getItem('login');
const cart = JSON.parse(localStorage.getItem('cartList')) || [];

const getData = async function (url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
  }

  return await response.json();
};

const valid = function (str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  // if(!nameReg.test(str)) {
  //   if (str.length < 20) return false;
  // }
  return nameReg.test(str);
}

function toggleModal () {
  modal.classList.toggle("is-open");
}

function toggleModalAuth () {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle("is-open");

}

function returnMain () {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
}

function autorized () {
  function logOut () {
    login = null;
    localStorage.removeItem('login');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }

  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';

  buttonOut.addEventListener('click', logOut);
}

function notautorized () {
  function logIn (event) {
    event.preventDefault();    
    if (valid(loginInput.value)) {
      login = loginInput.value;
      localStorage.setItem('login', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = 'red';
    }    
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth () {
  if (login) {
    autorized();
  } else {
    notautorized();
  }
}

function createCardRestaraunt ({ image, kitchen, name, price, stars, products, time_of_delivery: timeOfDelivery }) {
  const card = `
    <a class="card card-restaurant" data-products="${products}" data-info="${[name, price, stars, kitchen]}">
      <img src="${image}" alt="${name}" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${timeOfDelivery} мин.</span>
        </div>
        <div class="card-info">
          <div class="rating">
            ${stars}
          </div>
          <div class="price">От ${price} ₽</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
  `;

  cardsRestaurants.insertAdjacentHTML('beforeend', card)
} 

function createCardGood ({ description, image, name, price, id }) {
  const card = document.createElement('div');
  card.className = 'card';
  card.id = id;
  card.insertAdjacentHTML('beforeend', `   
    <img src="${image}" alt="${name}" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">
          ${description}
        </div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
    </div>
  `);
  
  cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods (e) {
  e.preventDefault();
  const target = e.target;
  const restaurant = target.closest('.card-restaurant');
  if (restaurant) {
    if (login) {
      let restaurantInfo = restaurant.dataset.info.split(',');
      cardsMenu.textContent = '';

      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');
      restaurantTitle.textContent = restaurantInfo[0];
      rating.textContent = restaurantInfo[2];
      minPrice.textContent = `От ${restaurantInfo[1]} ₽`;
      category.textContent = restaurantInfo[3];

      getData(`./db/${restaurant.dataset.products}`).then((data) => {
        data.forEach(createCardGood);
      });
    } else {
      toggleModalAuth();
    }    
  }
}

function search(e) {
  if(e.keyCode === 13) {
    const target = e.target;
    const value = target.value.toLowerCase().trim();
    if(!value || value.length < 3) {
      target.style.backgroundColor = 'tomato';
      setTimeout(() => {
        target.style.backgroundColor = '';
      }, 2000)
      return;
    }
    target.value = '';
    const goods = [];
    getData('./db/partners.json').then((data) => {
      const products = data.map((item) => {
        return item.products
      });

      products.forEach((product) => {
        getData(`./db/${product}`)
          .then((data) => {
            goods.push(...data);

            const searchGodds = goods.filter((item) => {
              return item.name.toLowerCase().includes(value);
            })

            cardsMenu.textContent = ''; 

            containerPromo.classList.add('hide');
            restaurants.classList.add('hide');
            menu.classList.remove('hide');

            restaurantTitle.textContent = 'Результат поиска';
            rating.textContent = '';
            minPrice.textContent = '';
            category.textContent = '';        
            
            return searchGodds
          })
          .then((data) => {
            data.forEach(createCardGood)
          })
      })
    });
  }
}

function addToCart(e) {
  const target = e.target;
  const buttonAddToCart = target.closest('.button-add-cart');
  
  if(buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = card.id;
    const food = cart.find((item) => {
      return item.id === id;
    })

    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1
      })
    }    
  }  
  localStorage.setItem('cartList', JSON.stringify(cart));
}

function renderCart () {
  modalBody.textContent = '';
  cart.forEach(({ id, title, cost, count}) => {
    const itemCard = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>`;

      modalBody.insertAdjacentHTML('afterbegin', itemCard)
  })

  const totalPrice = cart.reduce((result, item) => {
    return result + (parseFloat(item.cost) * item.count);
  }, 0);

  modalPricetag.textContent = totalPrice + ' ₽';
}

function changeCount(e) {
  const target = e.target;

  if(target.classList.contains('counter-button')) { 
    const food = cart.find((item) => {
      return item.id === target.dataset.id
    })
    if(target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1)
      }
    }
    if(target.classList.contains('counter-plus')) food.count++
    renderCart();
  }  
}

function init () {
  getData('./db/partners.json').then((data) => {
    data.forEach(createCardRestaraunt);
  });
  
  cartButton.addEventListener("click", () => {
    renderCart();
    toggleModal();
  });
  buttonClearCart.addEventListener('click', function() {
    cart.length = 0;
    localStorage.removeItem('cartList')
    renderCart();
  })
  modalBody.addEventListener('click', changeCount)
  cardsMenu.addEventListener('click', addToCart);
  close.addEventListener("click", toggleModal);
  cardsRestaurants.addEventListener('click', openGoods);
  logo.addEventListener('click', function() {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  })

  inputSearch.addEventListener('keydown', search)
  
  checkAuth(); 
  
  new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
      delay: 3000
    }
  })
}

init();
