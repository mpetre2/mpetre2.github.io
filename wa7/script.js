const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

const EXPIRATION_DURATION = 30 * 24 * 60 * 60 * 1000;
const THEME_DATA_KEY = 'userThemeData';
const OPT_OUT_KEY = 'themeOptOut';

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

const filterSelect = document.getElementById('event-type');
const eventCards = document.querySelectorAll('.event-card');

function applyEventFilter() {
    if (filterSelect){
        const value = filterSelect.value
        eventCards.forEach(card => {
            const type = card.dataset.type
            card.hidden = !(value === 'all' || type === value);
        })
    }
}
if (filterSelect) {
    applyEventFilter();
    filterSelect.addEventListener('change', applyEventFilter);

    filterSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyEventFilter();
    });
}

// WEEK 7 IN CLASS ACTIVITY (THEME)------------------------------------------------------------------------------------------------------

function toggleDataCollection(isOptedOut) {
    if (isOptedOut) {
        localStorage.setItem(OPT_OUT_KEY, 'true');
        localStorage.removeItem(THEME_DATA_KEY);
        setTheme('light', true);
    } else {
        localStorage.removeItem(OPT_OUT_KEY);
    }
}

function initializePrivacyControls() {
    const optOutCheckbox = document.getElementById('theme-opt-out');
    if (optOutCheckbox) {
        optOutCheckbox.checked = localStorage.getItem(OPT_OUT_KEY) === 'true';

        optOutCheckbox.addEventListener('change', () => {
            toggleDataCollection(optOutCheckbox.checked);
        });
    }
}

function clearAllLocalData() {
    localStorage.removeItem(THEME_DATA_KEY);
    localStorage.removeItem(OPT_OUT_KEY);
    
    setTheme('light', true); 

    const optOutCheckbox = document.getElementById('theme-opt-out');
    if (optOutCheckbox) {
        optOutCheckbox.checked = false;
    }

    alert('All saved preferences (theme and opt-out) have been cleared.');
}

function setTheme(themeName, isInitialLoad = false) {
    const currentTheme = themeName || 'light';
    const isOptedOut = localStorage.getItem(OPT_OUT_KEY) === 'true';
    
    if (!isOptedOut && !isInitialLoad) {
        const now = new Date().getTime();
        const expiryTime = now + EXPIRATION_DURATION;
        
        const themeData = {
            theme: currentTheme,
            expiry: expiryTime
        };
        localStorage.setItem(THEME_DATA_KEY, JSON.stringify(themeData));
    }
    
    document.body.className = currentTheme; 

    document.querySelectorAll('.theme-btn').forEach(button => {
        const buttonText = button.textContent.toLowerCase();
        
        button.classList.remove('active');

        if (buttonText.includes(currentTheme) && (buttonText.includes('light') || buttonText.includes('dark'))) {
            button.classList.add('active');
        }
    });
}

function getSavedTheme() {
    if (localStorage.getItem(OPT_OUT_KEY) === 'true') {
        return null;
    }
    
    const dataString = localStorage.getItem(THEME_DATA_KEY);
    if (!dataString) {
        return null; 
    }

    try {
        const themeData = JSON.parse(dataString);
        const now = new Date().getTime();

        if (themeData.expiry && themeData.expiry < now) {
            localStorage.removeItem(THEME_DATA_KEY);
            return null; 
        }
        
        return themeData.theme;

    } catch (e) {
        localStorage.removeItem(THEME_DATA_KEY);
        return null;
    }
}

function resetTheme() {
    localStorage.removeItem(THEME_DATA_KEY); 
    setTheme('light', true); 
    
    const optOutCheckbox = document.getElementById('theme-opt-out');
    if (optOutCheckbox && localStorage.getItem(OPT_OUT_KEY) !== 'true') {
        alert('Theme preference reset to default (light).');
    }
}


// THEME INITIALIZATION AND EVENT LISTENER SETUP
document.addEventListener('DOMContentLoaded', () => {
    
    const savedTheme = getSavedTheme();
    setTheme(savedTheme, true); 

    initializePrivacyControls(); 

    document.querySelectorAll('.theme-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const themeToSet = e.currentTarget.textContent.toLowerCase().includes('dark') ? 'dark' : 'light';
            setTheme(themeToSet); 
        });
    });

    const resetButton = document.getElementById('theme-reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetTheme);
    }
});