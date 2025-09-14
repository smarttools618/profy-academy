/**
 * Profy Academy - Educational Platform JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Bootstrap mobile menu is handled automatically by Bootstrap JS
    
    // For backward compatibility with old menu toggle if it exists
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mainNav && 
            mainNav.classList.contains('active') && 
            !event.target.closest('.main-nav') && 
            !event.target.closest('.menu-toggle')) {
            mainNav.classList.remove('active');
            if (menuToggle) {
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Initialize Bootstrap tooltips if any
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Form validation using Bootstrap validation styles
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if the link is a hash link and not empty
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    if (mainNav && mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                        if (menuToggle) {
                            const icon = menuToggle.querySelector('i');
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    }
                    
                    // Close Bootstrap mobile menu if open
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        navbarToggler.click(); // Use Bootstrap's built-in toggle
                    }
                    
                    // Calculate header height for offset (if header exists)
                    const headerEl = document.querySelector('header');
                    const headerHeight = headerEl ? headerEl.offsetHeight : 0;
                    
                    // Scroll to element with offset for fixed header
                    window.scrollTo({
                        top: targetElement.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Active navigation link based on scroll position
    function setActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const headerEl = document.querySelector('header');
        const headerHeight = headerEl ? headerEl.offsetHeight : 0;
        
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = sectionId;
            }
        });
        
        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Add active class to current section link
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
        
        // If at top of page, set home link as active
        if (window.scrollY < 100) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' || link.getAttribute('href') === '#hero') {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Call on scroll and on load
    window.addEventListener('scroll', setActiveNavLink);
    setActiveNavLink();

    // Header scroll effect
    const header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                header.style.background = '#ffffff';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = '#ffffff';
            }
        });
    }

    // Contact Form Validation
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            const message = document.getElementById('message');
            
            // Reset previous error styles
            [name, email, phone, message].forEach(field => {
                field.style.borderColor = '';
            });
            
            // Validate name
            if (!name.value.trim()) {
                name.style.borderColor = 'red';
                isValid = false;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim() || !emailRegex.test(email.value)) {
                email.style.borderColor = 'red';
                isValid = false;
            }
            
            // Validate phone
            const phoneRegex = /^[0-9]{8,}$/;
            if (!phone.value.trim() || !phoneRegex.test(phone.value)) {
                phone.style.borderColor = 'red';
                isValid = false;
            }
            
            // Validate message
            if (!message.value.trim()) {
                message.style.borderColor = 'red';
                isValid = false;
            }
            
            if (isValid) {
                // In a real application, you would send the form data to a server here
                // For now, we'll just show a success message
                alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.');
                contactForm.reset();
            } else {
                alert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح.');
            }
        });
    }
    
    // =========================
    // FAQ Enhancements (Search, Chips, Expand/Collapse, Reveal)
    // =========================
    (function initFaq() {
        const faqSection = document.getElementById('faq');
        if (!faqSection) return;

        const searchInput = document.getElementById('faqSearch');
        const clearBtn = faqSection.querySelector('.clear-search');
        const chipsWrap = document.getElementById('faqChips');
        const countEl = document.getElementById('faqCount');
        const emptyEl = document.getElementById('faqEmpty');
        const expandAllBtn = document.getElementById('expandAll');
        const collapseAllBtn = document.getElementById('collapseAll');
        const items = Array.from(faqSection.querySelectorAll('.faq-item'));

        function normalize(str) {
            return (str || '')
                .toString()
                .toLowerCase()
                .normalize('NFKD')
                .replace(/[\u064B-\u065F]/g, '') // remove Arabic diacritics
                .trim();
        }

        let activeFilter = 'all';

        function updateCount(visibleCount) {
            if (!countEl) return;
            // Simple Arabic pluralization for "سؤال"
            // We'll use: 0 نتائج، 1 سؤال، 2 سؤالان، 3-10 أسئلة، >10 سؤال
            const n = visibleCount;
            let text = `${n} سؤال`;
            if (n === 0) text = 'لا أسئلة';
            else if (n === 1) text = 'سؤال واحد';
            else if (n === 2) text = 'سؤالان';
            else if (n >= 3 && n <= 10) text = `${n} أسئلة`;
            else text = `${n} سؤال`;
            countEl.textContent = text;
        }

        function filterFaq() {
            const term = normalize(searchInput ? searchInput.value : '');
            let visible = 0;

            items.forEach(item => {
                const text = normalize(item.textContent);
                const tags = normalize(item.dataset.tags || '');
                const matchesTerm = !term || text.includes(term) || tags.includes(term);
                const matchesChip = activeFilter === 'all' || tags.includes(normalize(activeFilter));
                const shouldShow = matchesTerm && matchesChip;
                item.classList.toggle('d-none', !shouldShow);
                if (shouldShow) visible++;
            });

            updateCount(visible);
            if (emptyEl) emptyEl.classList.toggle('d-none', visible !== 0);
            if (clearBtn && searchInput) clearBtn.classList.toggle('d-none', searchInput.value.length === 0);
        }

        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', filterFaq);
        }

        // Clear search
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                filterFaq();
                searchInput.focus();
            });
        }

        // Chips filter
        if (chipsWrap) {
            chipsWrap.addEventListener('click', (e) => {
                const btn = e.target.closest('.chip');
                if (!btn) return;
                chipsWrap.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter || 'all';
                filterFaq();
            });
        }

        // Expand/Collapse all using Bootstrap Collapse
        function setAll(open) {
            items.forEach(item => {
                const collapseEl = item.querySelector('.accordion-collapse');
                if (!collapseEl) return;
                const instance = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
                open ? instance.show() : instance.hide();
            });
        }

        if (expandAllBtn) expandAllBtn.addEventListener('click', () => setAll(true));
        if (collapseAllBtn) collapseAllBtn.addEventListener('click', () => setAll(false));

        // Reveal on scroll animation
        const revealEls = items;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealEls.forEach(el => io.observe(el));

        // Initial filter and count
        filterFaq();
    })();
});