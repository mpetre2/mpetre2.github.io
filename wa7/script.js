const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');


function showMenu() {
    var shown = navMenu.classList.toggle("show");
    navMenu.classList.toggle("hide");

    if (shown) {
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.style.transform = "rotate(180deg)"
    }
    else {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.style.transform = "rotate(0deg)"
    }
}

function checkKey(key_code) {
    if (key_code == 32) {
        showMenu();
        console.log("worked");
    }
}

navToggle.addEventListener('click', showMenu);

navToggle.addEventListener('keydown', (e) => {
  if (e.key === " " || e.key === "spacebar" || e.key === "Enter") {
    e.preventDefault();
    showMenu();
  }
});

//filter code for the events page
const filterSelect = document.getElementById('event-type');
const eventCards = document.querySelectorAll('.event-card');

function applyEventFilter() {
  const value = filterSelect.value;
  eventCards.forEach(card => {
    const type = card.dataset.type;
    card.hidden = !(value === 'all' || type === value);
  });
}

// when they are changing the filter
applyEventFilter();
filterSelect.addEventListener('change', applyEventFilter);

// keyboard options
filterSelect.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyEventFilter();
});

//WEEK 7 IN CLASS ACTIVITY (THEME)------------------------------------------------------------------------------------------------------
//the button now lets users control the data and pick light or dark mode, this is necessary to make it a more enjoyable experience for the user and to avoid irritation  
let btn = document.querySelector('#Theme').addEventListener('click', toggleTheme);
  
  function toggleTheme() {
    //the data we are storing is their color prefrence for theme
    const currentTheme = localStorage.getItem('userTheme') || 'light';
    
    let newTheme;
    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else {
        newTheme = 'light';

    }
  //console.log("theme workes");
    setTheme(newTheme);
  } 

  // Save user's theme choice
  function setTheme(themeName) {
      localStorage.setItem('userTheme', themeName);
      document.body.className = themeName;
  }

// Load saved theme on page load
setTheme(localStorage.getItem('userTheme') || 'light');