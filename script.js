// ===== Theme Management =====
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return prefersDark.matches ? 'dark' : 'light';
}

setTheme(getPreferredTheme());

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== Welcome Animation =====
document.addEventListener('DOMContentLoaded', () => {
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    
    setTimeout(() => {
        welcomeOverlay.classList.add('hidden');
        setTimeout(() => {
            welcomeOverlay.style.display = 'none';
        }, 600);
    }, 3000);
});

// ===== DOM Elements =====
const filterButtons = document.querySelectorAll('.filter-btn[data-subject]');
const lessonCards = document.querySelectorAll('.lesson-card');
const searchInput = document.getElementById('searchInput');
const lessonCount = document.getElementById('lessonCount');
const emptyState = document.getElementById('emptyState');
const lessonsGrid = document.getElementById('lessonsGrid');
const header = document.querySelector('.header');

let currentSubject = 'all';
let searchQuery = '';

// ===== Header Scroll Effect =====
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, { passive: true });

// ===== Filter Lessons =====
function filterLessons() {
    let visibleCount = 0;
    
    lessonCards.forEach((card) => {
        const cardSubject = card.dataset.subject;
        const cardTitle = card.querySelector('h3').textContent.toLowerCase();
        
        const subjectMatch = currentSubject === 'all' || cardSubject === currentSubject;
        const searchMatch = searchQuery === '' || cardTitle.includes(searchQuery.toLowerCase());
        
        if (subjectMatch && searchMatch) {
            card.classList.remove('hidden', 'fade-out');
            card.style.animationDelay = `${visibleCount * 0.1}s`;
            visibleCount++;
        } else {
            card.classList.add('fade-out');
            setTimeout(() => {
                if (card.classList.contains('fade-out')) {
                    card.classList.add('hidden');
                }
            }, 200);
        }
    });
    
    updateUI(visibleCount);
}

// ===== Update UI =====
function updateUI(count) {
    lessonCount.textContent = `${count} ${count === 1 ? 'درس' : 'دروس'}`;
    
    if (count === 0) {
        emptyState.classList.remove('hidden');
        lessonsGrid.style.display = 'none';
    } else {
        emptyState.classList.add('hidden');
        lessonsGrid.style.display = 'grid';
    }
}

// ===== Subject Filter =====
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSubject = btn.dataset.subject;
        filterLessons();
    });
});

// ===== Search =====
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim();
        filterLessons();
    }, 250);
});

// ===== Lazy Load Iframes =====
if ('IntersectionObserver' in window) {
    const iframes = document.querySelectorAll('.video-wrapper iframe');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    iframe.removeAttribute('data-src');
                }
                observer.unobserve(iframe);
            }
        });
    }, { rootMargin: '100px' });
    
    iframes.forEach(iframe => {
        if (iframe.src && !iframe.src.includes('about:blank')) {
            iframe.dataset.src = iframe.src;
            iframe.src = 'about:blank';
            observer.observe(iframe);
        }
    });
}

// ===== Ripple Effect =====
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    ripple.classList.add('ripple-effect');
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
}

document.querySelectorAll('.filter-btn, .resource-btn').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

// ===== Scroll Progress =====
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = windowHeight > 0 ? (window.pageYOffset / windowHeight) * 100 : 0;
    scrollProgress.style.width = scrolled + '%';
}, { passive: true });

// ===== Init =====
updateUI(lessonCards.length);
