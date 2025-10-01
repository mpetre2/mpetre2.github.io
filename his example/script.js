let btn = document.querySelector('#theme').addEventListener('click', theme);

function theme(){
    setTheme("light")
}

// Save user's theme choice
function setTheme(theme) {
    let inTheme = theme; 
    if (inTheme == 'dark') {
        theme = 'light';
    }
    else {
        theme = 'dark';
    }
    localStorage.setItem('userTheme', theme);
    document.body.className = theme;
}

// Load saved theme on page load
window.addEventListener('load', function() {
    const savedTheme = localStorage.getItem('userTheme') || 'light';
    document.body.className = savedTheme;
});