// DOM Elements
const splash = document.getElementById('splash');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');
const themeBtn = document.getElementById('themeBtn');
const themeToggle = document.getElementById('themeToggle');
const navItems = document.querySelectorAll('.nav-item');
const lessons = document.querySelectorAll('.lesson');
const lessonsContainer = document.getElementById('lessons');
const emptyState = document.getElementById('empty');
const pageTitle = document.getElementById('pageTitle');
const lessonCount = document.getElementById('lessonCount');

// Subject names in Arabic
const subjectNames = {
    all: 'جميع الدروس',
    arabic: 'اللغة العربية',
    math: 'الرياضيات',
    science: 'الإيقاظ العلمي'
};

// Hide splash screen
window.addEventListener('load', () => {
    setTimeout(() => {
        splash.classList.add('hidden');
    }, 800);
});

// Theme Management
const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeUI();

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeUI();
}

function updateThemeUI() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const icon = isDark ? 'fa-sun' : 'fa-moon';
    const text = isDark ? 'الوضع النهاري' : 'الوضع الليلي';
    
    themeBtn.innerHTML = `<i class="fas ${icon}"></i><span>${text}</span>`;
    themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
}

themeBtn.addEventListener('click', toggleTheme);
themeToggle.addEventListener('click', toggleTheme);

// Mobile Sidebar
function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

menuBtn.addEventListener('click', openSidebar);
overlay.addEventListener('click', closeSidebar);

// Filter Lessons
function filterLessons(subject) {
    let count = 0;
    
    lessons.forEach(lesson => {
        const match = subject === 'all' || lesson.dataset.subject === subject;
        lesson.classList.toggle('hidden', !match);
        if (match) count++;
    });
    
    // Update UI
    pageTitle.textContent = subjectNames[subject];
    lessonCount.textContent = count === 1 ? 'درس واحد متاح' : `${count} دروس متاحة`;
    
    // Toggle empty state
    emptyState.hidden = count > 0;
    lessonsContainer.style.display = count > 0 ? 'grid' : 'none';
    
    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        closeSidebar();
    }
}

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        filterLessons(item.dataset.filter);
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// Handle resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024) {
            closeSidebar();
        }
    }, 100);
});
