// DOM Elements
const splash = document.getElementById('splash');
const gradeSelection = document.getElementById('gradeSelection');
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
const gradeButtons = document.querySelectorAll('.grade-btn');
const gradeMobileBtn = document.getElementById('gradeMobileBtn');
const mainGradeBtn = document.getElementById('mainGradeBtn');
const currentGradeLabels = document.querySelectorAll('#currentGradeLabel');

// Subject names in Arabic
const subjectNames = {
    all: 'جميع الدروس',
    arabic: 'اللغة العربية',
    math: 'الرياضيات',
    science: 'الإيقاظ العلمي',
    english: 'الإنجليزية',
    french: 'الفرنسية'
};

// Grade names
const gradeNames = {
    '4': 'السنة الرابعة',
    '5': 'السنة الخامسة',
    '6': 'السنة السادسة',
    '7': 'السنة السابعة'
};

// Loading Progress
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const splashStatus = document.getElementById('splashStatus');
const splashParticles = document.getElementById('splashParticles');
const iframes = document.querySelectorAll('iframe');
let loadedCount = 0;
const totalItems = iframes.length || 1;

// Generate floating particles
function createParticles() {
    const count = 30;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'splash-particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 6 + 4) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        particle.style.opacity = Math.random() * 0.4 + 0.1;
        splashParticles.appendChild(particle);
    }
}
createParticles();

// Status messages for different progress stages
const statusMessages = [
    { threshold: 0, text: 'جاري التحميل...' },
    { threshold: 25, text: 'تحضير الدروس...' },
    { threshold: 50, text: 'تحميل المحتوى...' },
    { threshold: 75, text: 'اللمسات الأخيرة...' },
    { threshold: 95, text: '!جاهز تقريباً' },
];

let displayedPercent = 0;
let animFrameId = null;

function updateProgress(percent) {
    const value = Math.min(100, Math.round(percent));
    progressBar.style.width = value + '%';

    // Animate the percentage counter smoothly
    if (animFrameId) cancelAnimationFrame(animFrameId);
    const start = displayedPercent;
    const startTime = performance.now();
    const duration = 300;

    function animateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (value - start) * eased);
        progressPercent.textContent = current + '%';
        displayedPercent = current;

        if (progress < 1) {
            animFrameId = requestAnimationFrame(animateCounter);
        }
    }
    animFrameId = requestAnimationFrame(animateCounter);

    // Update status text
    for (let i = statusMessages.length - 1; i >= 0; i--) {
        if (value >= statusMessages[i].threshold) {
            if (splashStatus.textContent !== statusMessages[i].text) {
                splashStatus.style.opacity = '0';
                setTimeout(() => {
                    splashStatus.textContent = statusMessages[i].text;
                    splashStatus.style.opacity = '1';
                }, 150);
            }
            break;
        }
    }
}

function hideLoading() {
    updateProgress(100);
    if (splashStatus) {
        setTimeout(() => {
            splashStatus.textContent = '!مرحباً بك';
            splashStatus.style.color = 'rgba(255,255,255,0.7)';
        }, 200);
    }
    setTimeout(() => {
        splash.classList.add('hidden');
        // Show grade selection after splash
        showGradeSelection();
    }, 500);
}

// Smooth progress animation with natural easing
let fakeProgress = 0;
const progressInterval = setInterval(() => {
    if (fakeProgress < 85) {
        const remaining = 85 - fakeProgress;
        const increment = Math.random() * Math.min(remaining * 0.15, 12) + 2;
        fakeProgress = Math.min(85, fakeProgress + increment);
        updateProgress(fakeProgress);
    }
}, 250);

// Track iframe loads
iframes.forEach(iframe => {
    iframe.addEventListener('load', () => {
        loadedCount++;
        clearInterval(progressInterval);
        updateProgress((loadedCount / totalItems) * 100);
        if (loadedCount >= totalItems) hideLoading();
    });
});

// Fallback timeout (max 5 seconds)
setTimeout(() => {
    if (!splash.classList.contains('hidden')) {
        clearInterval(progressInterval);
        hideLoading();
    }
}, 5000);

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
        // Close grade selection if open
        if (gradeSelection.style.display === 'flex' && !gradeSelection.classList.contains('hidden')) {
            hideGradeSelection();
        } else {
            closeSidebar();
        }
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

// ===== Grade Selection =====

let gradeParticlesCreated = false;

// Create particles for grade selection background
function createGradeParticles() {
    if (gradeParticlesCreated) return;
    gradeParticlesCreated = true;
    const container = document.getElementById('gradeParticles');
    if (!container) return;
    const count = 20;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'splash-particle';
        const size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 6 + 4) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        container.appendChild(particle);
    }
}

// Show grade selection overlay
function showGradeSelection() {
    gradeSelection.style.display = 'flex';
    gradeSelection.classList.remove('hidden');
    // Re-trigger button animations
    const btns = gradeSelection.querySelectorAll('.grade-btn');
    btns.forEach(btn => {
        btn.style.animation = 'none';
        btn.offsetHeight; // force reflow
        btn.style.animation = '';
    });
    createGradeParticles();
    document.body.style.overflow = 'hidden';
}

// Hide grade selection overlay
function hideGradeSelection() {
    gradeSelection.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(() => {
        gradeSelection.style.display = 'none';
    }, 600);
}

// Show toast notification
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-clock"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// Grade button handlers
gradeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const grade = btn.dataset.grade;

        if (grade === '6') {
            // Active grade — dismiss grade selection and show app
            hideGradeSelection();
        } else {
            // Locked grades — show coming soon toast
            showToast('هذا المستوى غير متاح حالياً — قريباً إن شاء الله!');
        }
    });
});

// Main section grade button
if (mainGradeBtn) {
    mainGradeBtn.addEventListener('click', () => {
        showGradeSelection();
    });
}

// Mobile topbar grade button
gradeMobileBtn.addEventListener('click', () => {
    showGradeSelection();
});


