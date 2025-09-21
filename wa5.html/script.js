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