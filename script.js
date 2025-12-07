// Theme
const themeToggle = document.getElementById('themeToggle');
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Loading Screen with percentage
const loadingScreen = document.getElementById('loadingScreen');
const loadingProgressBar = document.getElementById('loadingProgressBar');
const loadingPercent = document.getElementById('loadingPercent');
const iframes = document.querySelectorAll('iframe');
let loadedCount = 0;
const totalItems = iframes.length;

function updateProgress(percent) {
    loadingProgressBar.style.width = percent + '%';
    loadingPercent.textContent = Math.round(percent) + '%';
}

function checkAllLoaded() {
    loadedCount++;
    const percent = (loadedCount / totalItems) * 100;
    updateProgress(percent);
    
    if (loadedCount >= totalItems) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.remove(), 400);
        }, 200);
    }
}

// Animate progress smoothly with fallback
let fakeProgress = 0;
const progressInterval = setInterval(() => {
    if (fakeProgress < 90 && loadedCount < totalItems) {
        fakeProgress += Math.random() * 15;
        if (fakeProgress > 90) fakeProgress = 90;
        updateProgress(fakeProgress);
    }
}, 300);

// Set timeout fallback (max 5 seconds wait)
setTimeout(() => {
    if (!loadingScreen.classList.contains('hidden')) {
        clearInterval(progressInterval);
        updateProgress(100);
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.remove(), 400);
        }, 200);
    }
}, 5000);

iframes.forEach(iframe => {
    iframe.addEventListener('load', () => {
        clearInterval(progressInterval);
        checkAllLoaded();
    });
});

// Elements
const filterBtns = document.querySelectorAll('.filter-btn[data-subject]');
const cards = document.querySelectorAll('.lesson-card');
const lessonCount = document.getElementById('lessonCount');
const emptyState = document.getElementById('emptyState');
const grid = document.getElementById('lessonsGrid');

let subject = 'all';

// Filter
function filter() {
    let count = 0;
    cards.forEach(card => {
        const match = subject === 'all' || card.dataset.subject === subject;
        card.classList.toggle('hidden', !match);
        if (match) count++;
    });
    
    lessonCount.textContent = count + ' دروس';
    emptyState.classList.toggle('hidden', count > 0);
    grid.style.display = count > 0 ? 'grid' : 'none';
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        subject = btn.dataset.subject;
        filter();
    });
});

// Scroll progress
const progress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
}, { passive: true });
