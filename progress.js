// Progress bar and scroll position saving
export class ReadingProgress {
    constructor(barId) {
        this.bar = document.getElementById(barId);
        this.init();
    }

    init() {
        // Update progress on scroll
        window.addEventListener('scroll', () => this.updateProgress());
        
        // Check for saved scroll position
        this.checkPersistence();
    }

    updateProgress() {
        const area = document.documentElement.scrollHeight - window.innerHeight;
        const pct = (window.scrollY / area) * 100;
        
        // Update bar width
        this.bar.style.width = `${pct}%`;
        
        // Save position in sessionStorage (unique per page)
        const pageKey = `reading-pos-${window.location.pathname}`;
        sessionStorage.setItem(pageKey, window.scrollY);
    }

    checkPersistence() {
        const pageKey = `reading-pos-${window.location.pathname}`;
        const pos = sessionStorage.getItem(pageKey);
        
        // Prompt to resume if scrolled significantly
        const isExcludedPage = window.location.pathname.endsWith('index.html') || 
                               window.location.pathname.endsWith('contact.html') ||
                               window.location.pathname === '/' ||
                               window.location.pathname === '';

        if (pos && parseInt(pos) > 100 && !isExcludedPage) {
            
            // Create toast notification
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            
            toast.innerHTML = `
                <strong style="color: var(--accent-color); font-family: var(--font-display); letter-spacing: 1px;">SYSTEM_RESUME</strong>
                <span style="font-size: var(--text-sm);">Restore previous session state?</span>
                <div class="toast-buttons">
                    <button class="toast-btn" id="resume-yes">ACCEPT</button>
                    <button class="toast-btn" id="resume-no">DECLINE</button>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            // Show toast
            setTimeout(() => toast.classList.add('show'), 500);

            // Resume scrolling
            document.getElementById('resume-yes').addEventListener('click', () => {
                window.scrollTo({ top: parseInt(pos), behavior: 'smooth' });
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            });

            // Decline resume
            document.getElementById('resume-no').addEventListener('click', () => {
                sessionStorage.removeItem(pageKey);
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            });
        }
    }
}