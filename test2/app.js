// задача 3
const API_POSTS = 'https://fakestoreapi.com/products';

const getApi = async () => {
  try {
    const response = await fetch(API_POSTS);
    if (!response.ok) {
      throw new Error(`ошибка ${response.statusText}`);
    }
    const data = await response.json();
    data.forEach((product) => {
      console.log(product.title);
    });
  } catch (error) {
    console.error(error);
  }
};
getApi();
// 4

const buttons = document.querySelectorAll('button');
const divButtons = document.querySelector('.div-buttons');
divButtons.addEventListener('click', (event) => {
  document.body.style.backgroundColor = event.target.textContent;
});

// 5

const block = document.querySelector('.block');
const btn = document.getElementById('btn');

btn.addEventListener('click', () => {
  block.classList.toggle('block-hidden');
});

// 6

const countNum = document.querySelector('.count-num');
let count = 0;

countNum.textContent = count;

const timer = setInterval(() => {
  count++;
  countNum.textContent = count;

  if (count === 100) {
    clearInterval(timer);
  }
}, 1);

// 7

const getBtn = document.getElementById('getBtn');

const MY_JSON = 'name.json';
const myJson = async () => {
  try {
    const response = await fetch(MY_JSON);
    if (!response.ok) {
      throw new Error(`ошибка ${response}`);
    }
    const data = await response.json();
    //
    console.log(data);
    //
    data.forEach((name) => {
      console.log(name.name);
    });
  } catch (error) {
    console.error(error);
  }
};
getBtn.addEventListener('click', myJson);
