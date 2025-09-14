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
                    
                    // Calculate header height for offset
                    const headerHeight = document.querySelector('header').offsetHeight;
                    
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
        const headerHeight = document.querySelector('header').offsetHeight;
        
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
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            header.style.background = '#ffffff';
        } else {
            header.style.boxShadow = 'none';
            header.style.background = '#ffffff';
        }
    });

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
});