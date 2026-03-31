const themeToggle = document.querySelector('#theme-toggle');

// Toggle theme and remember in localStorage
if (themeToggle) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeToggle.checked = currentTheme === 'dark';

    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}


const timelineList = document.querySelector('.timeline-list');

// Use event delegation for timeline expansion
if (timelineList) {
    timelineList.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.timeline-item');
        if (!clickedItem) return;

        const isExpanded = clickedItem.getAttribute('aria-expanded') === 'true';
        clickedItem.setAttribute('aria-expanded', !isExpanded);

        // Inject image inline on mobile when expanded
        if (window.matchMedia('(max-width: 1023px)').matches) {
            const content = clickedItem.querySelector('.timeline-content');
            const img = content.querySelector('.timeline-inline-img');

            if (!isExpanded) {
                if (!img) {
                    const cards = timelineList.querySelectorAll('.timeline-card');
                    const card = clickedItem.querySelector('.timeline-card');
                    const index = Array.from(cards).indexOf(card);
                    const newImg = document.createElement('img');
                    newImg.src = `images/timeline_entry_${index + 1}.jpg`;
                    newImg.alt = 'Timeline memory';
                    newImg.className = 'timeline-inline-img';
                    content.appendChild(newImg);
                }
            } else if (img) {
                img.remove();
            }
        }
    });
}


const tagFilterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card:not(#project-modal .project-card)');

if (tagFilterButtons.length > 0) {
    const urlParams = new URLSearchParams(window.location.search);
    let activeFilters = urlParams.get('tags') ? urlParams.get('tags').split(',') : ['all'];

    // Update visibility based on active filters
    function renderFilters() {
        tagFilterButtons.forEach(btn => {
            const val = btn.getAttribute('data-filter');
            const isActive = activeFilters.includes(val) || (activeFilters.includes('all') && val === 'all');
            btn.classList.toggle('active', isActive);
        });

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const match = activeFilters.includes('all') || activeFilters.some(tag => category.includes(tag));

            if (match) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => card.style.display = 'none', 400);
            }
        });
    }

    tagFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const val = button.getAttribute('data-filter');

            if (val === 'all') {
                activeFilters = ['all'];
            } else {
                if (activeFilters.includes('all')) activeFilters = [];
                if (activeFilters.includes(val)) {
                    activeFilters = activeFilters.filter(t => t !== val);
                    if (activeFilters.length === 0) activeFilters = ['all'];
                } else {
                    activeFilters.push(val);
                }
            }

            const url = new URL(window.location);
            if (activeFilters.includes('all')) {
                url.searchParams.delete('tags');
            } else {
                url.searchParams.set('tags', activeFilters.join(','));
            }
            window.history.pushState({}, '', url);
            renderFilters();
        });
    });

    renderFilters();

    // Sync filters with browser history
    window.addEventListener('popstate', () => {
        const historyParams = new URLSearchParams(window.location.search);
        activeFilters = historyParams.get('tags') ? historyParams.get('tags').split(',') : ['all'];
        renderFilters();
    });
}


const contactFormNode = document.getElementById('contact-form');

if (contactFormNode) {
    contactFormNode.addEventListener('submit', (event) => {
        event.preventDefault();

        const errorNode = contactFormNode.querySelector('.error-msg');
        if (errorNode) errorNode.style.display = 'none';

        if (contactFormNode.checkValidity()) {
            contactFormNode.style.opacity = '0';
            setTimeout(() => {
                contactFormNode.style.display = 'none';
                const success = document.getElementById('form-success');
                if (success) {
                    success.style.display = 'block';
                    success.classList.add('hero-animate');
                }
            }, 400);
        } else {
            // Validation error messages
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');

            let error = "> ERR: INVALID_PAYLOAD";

            if (name && !name.validity.valid) error = "> ERR: IDENTIFICATION TOO SHORT (MIN 4 CHARS)";
            else if (email && !email.validity.valid) error = "> ERR: INVALID_SECURE_CHANNEL (CHECK TYPE)";
            else if (message && !message.validity.valid) error = "> ERR: PAYLOAD_TOO_SHORT (MIN 3 CHARS)";

            if (errorNode) {
                errorNode.innerText = error;
                errorNode.style.display = 'block';
            }
            contactFormNode.classList.add('was-validated');
        }
    });
}


// Intersection observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${index * 100}ms`;
            entry.target.classList.add('in-view');
        } else {
            entry.target.style.transitionDelay = '0ms';
            entry.target.classList.remove('in-view');
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll('.scroll-animate, .timeline-item').forEach(node => observer.observe(node));


const projectModalWindow = document.getElementById('project-modal');
const projectModalCloseBtn = document.getElementById('close-modal');

if (projectModalWindow && projectModalCloseBtn) {
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').innerText;
            const tag = card.querySelector('.project-tag').innerText;
            const brief = card.querySelector('p').innerText;

            document.getElementById('modal-title').innerText = title;
            document.getElementById('modal-tag').innerText = tag;
            document.getElementById('modal-brief').innerText = brief;
            document.getElementById('modal-full').innerText = card.getAttribute('data-full');
            document.getElementById('modal-origin').innerText = card.getAttribute('data-origin');
            document.getElementById('modal-evolution').innerText = card.getAttribute('data-evolution');
            document.getElementById('modal-tradeoffs').innerText = card.getAttribute('data-tradeoffs');

            projectModalWindow.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });

        // Tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            card.style.transition = 'transform 0.1s ease-out';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            card.style.transition = 'var(--transition-main)';
        });
    });

    projectModalCloseBtn.addEventListener('click', () => {
        projectModalWindow.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === projectModalWindow) {
            projectModalWindow.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Modal tilt effect
    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.addEventListener('mousemove', (e) => {
            const rect = modal.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 80;
            const rotateY = (centerX - x) / 80;

            modal.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            modal.style.transition = 'transform 0.1s ease-out';
        });

        modal.addEventListener('mouseleave', () => {
            modal.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg)`;
            modal.style.transition = 'var(--transition-main)';
        });
    });
}


// Timeline image hover display
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

document.querySelectorAll('.timeline-card').forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        if (isMobile()) return;
        const display = document.getElementById('timeline-hover-display');
        const img = document.getElementById('timeline-img');
        if (display && img) {
            img.src = `images/timeline_entry_${index + 1}.jpg`;
            display.style.opacity = '1';
        }
    });

    card.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        const display = document.getElementById('timeline-hover-display');
        if (display) display.style.opacity = '0';
    });
});


const display = document.querySelector('.typewriter-text');
const phrases = [
    '> 0x1337 Enthusiast',
    '> Initializing System_Daemon()',
    '> Memory Access Granted',
    '> True Pythonista'
];

let phraseIdx = 0;
let charIdx = 2;
let chars = ['>', ' '];
let isDeleting = false;

// Typewriter effect
function type() {
    if (!display) return;

    const text = phrases[phraseIdx];
    let nextSpeed = isDeleting ? 45 : 100;

    if (!isDeleting) {
        if (charIdx < text.length) {
            chars.push(text[charIdx]);
            charIdx++;
            display.innerHTML = chars.join('');
        } else {
            // Reached end: wait then start deleting
            isDeleting = true;
            nextSpeed = 2000;
        }
    } else {
        if (charIdx > 2) {
            chars.pop();
            charIdx--;
            display.innerHTML = chars.join('');
        } else {
            // Finished deleting: move to next phrase
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            nextSpeed = 500;
        }
    }

    setTimeout(type, nextSpeed);
}

if (display) setTimeout(type, 800);


// Magnetic button effect
const magneticButtons = document.querySelectorAll('.nav-links a, .filter-btn, .magnetic-btn');

magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px) scale(1)`;
    });
});


const motionToggle = document.querySelector('#motion-toggle');

// Motion accessibility toggle
if (motionToggle) {
    const isReduced = localStorage.getItem('reducedMotion') === 'true';
    const hud = document.querySelector('.hud-right');

    if (isReduced) {
        motionToggle.checked = true;
        document.body.classList.add('reduced-motion');
        if (hud) hud.innerHTML = 'STATUS // SECURE<br>MINIMALIST: ON';
    } else {
        if (hud) hud.innerHTML = 'STATUS // SECURE<br>MINIMALIST: OFF';
    }

    motionToggle.addEventListener('change', (e) => {
        const active = e.target.checked;
        document.body.classList.toggle('reduced-motion', active);
        localStorage.setItem('reducedMotion', active);
        if (hud) hud.innerHTML = `STATUS // SECURE<br>MINIMALIST: ${active ? 'ON' : 'OFF'}`;
    });
}