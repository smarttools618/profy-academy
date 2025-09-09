        // Part 1: The JavaScript Configuration Object (siteConfig)
        const siteConfig = {
            supabase: {
                url: 'https://dosjygvqyoyubqechstd.supabase.co',
                anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc2p5Z3ZxeW95dWJxZWNoc3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzYyNzAsImV4cCI6MjA3MzAxMjI3MH0.dX0MCL94EsX4vbOpWFNL6PHZlr50FT6TI4Jh2CKIGAo'
            },
            theme: {
                font: {
                    primary: "'Inter', sans-serif",
                    monospace: "'Roboto Mono', monospace"
                },
                colors: {
                    background: "hsl(240, 10%, 4%)",
                    primary: "hsl(220, 100%, 65%)",
                    accent: "hsl(290, 100%, 60%)",
                    cardBackground: "hsla(240, 10%, 10%, 0.5)",
                    cardBorder: "hsla(220, 100%, 80%, 0.1)",
                    textPrimary: "hsl(240, 8%, 95%)",
                    textSecondary: "hsl(240, 5%, 65%)",
                    success: "hsl(140, 70%, 50%)"
                },
                animations: {
                    cardEntrance: "fade-in-blur 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards",
                }
            },
            staticText: {
                headerTitle: "المركز المباشر للمنصة",
                heroCardTitle: "الحصة القادمة المباشرة",
                scheduleTitle: "الجدول الكامل للحصص",
                liveNowLabel: "مباشر الآن 🔥",
                upcomingLabel: "قادمة",
                endedLabel: "انتهت (شاهد التسجيل)"
            }
        };

        // Import Supabase client
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

        // DOM Elements
        const DOMElements = {
            root: document.documentElement,
            headerTitle: document.getElementById('header-title'),
            heroCard: document.getElementById('hero-card'),
            heroSkeleton: document.getElementById('hero-skeleton'),
            heroContent: document.getElementById('hero-content'),
            heroCardTitle: document.getElementById('hero-card-title'),
            heroTopic: document.getElementById('hero-topic'),
            heroSubject: document.getElementById('hero-subject'),
            heroStatusContainer: document.getElementById('hero-status-container'),
            heroStatusLabel: document.getElementById('hero-status-label'),
            countdown: document.getElementById('countdown'),
            heroCtaButton: document.getElementById('hero-cta-button'),
            scheduleTitle: document.getElementById('schedule-title'),
            scheduleGrid: document.getElementById('schedule-grid'),
            appContainer: document.getElementById('app-container'),
        };

        let countdownInterval;
        let sessionsCache = [];

        // Main App Logic
        function main() {
            applyTheme();
            applyStaticText();
            
            try {
                const supabase = initializeSupabase();
                fetchAndRenderSessions(supabase);
                setupRealtimeSubscription(supabase);
            } catch (error) {
                console.error("Initialization failed:", error);
                displayError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقًا.");
            }
        }

        function applyTheme() {
            const { colors, font, animations } = siteConfig.theme;
            DOMElements.root.style.setProperty('--background-color', colors.background);
            DOMElements.root.style.setProperty('--primary-color', colors.primary);
            DOMElements.root.style.setProperty('--accent-color', colors.accent);
            DOMElements.root.style.setProperty('--card-background-color', colors.cardBackground);
            DOMElements.root.style.setProperty('--card-border-color', colors.cardBorder);
            DOMElements.root.style.setProperty('--text-primary-color', colors.textPrimary);
            DOMElements.root.style.setProperty('--text-secondary-color', colors.textSecondary);
            DOMElements.root.style.setProperty('--success-color', colors.success);
            DOMElements.root.style.setProperty('--font-primary', font.primary);
            DOMElements.root.style.setProperty('--font-monospace', font.monospace);
            DOMElements.root.style.setProperty('--animation-card-entrance', animations.cardEntrance);
            
            // For aurora and glow effects
            const primaryRgb = hexToRgb(hslToHex(colors.primary));
            const accentRgb = hexToRgb(hslToHex(colors.accent));
            DOMElements.root.style.setProperty('--primary-color-alpha', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`);
            DOMElements.root.style.setProperty('--accent-color-alpha', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.5)`);
        }

        function applyStaticText() {
            const { staticText } = siteConfig;
            DOMElements.headerTitle.textContent = staticText.headerTitle;
            DOMElements.heroCardTitle.textContent = staticText.heroCardTitle;
            DOMElements.scheduleTitle.textContent = staticText.scheduleTitle;
        }

        function initializeSupabase() {
            const { url, anonKey } = siteConfig.supabase;
            if (!url || url === 'YOUR_SUPABASE_URL' || !anonKey || anonKey === 'YOUR_SUPABASE_ANON_KEY') {
                throw new Error("Supabase credentials are not configured in siteConfig.");
            }
            return createClient(url, anonKey);
        }

        async function fetchAndRenderSessions(supabase) {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .in('status', ['Upcoming', 'Live'])
                .order('session_time', { ascending: true });

            if (error) {
                console.error("Error fetching sessions:", error);
                displayError("حدث خطأ أثناء جلب بيانات الحصص.");
                return;
            }
            
            sessionsCache = data;
            processSessions();
        }

        function processSessions() {
            if (sessionsCache.length === 0) {
                // Handle no upcoming sessions
                displayNoSessionsMessage();
                return;
            }

            // The next session is the first one in the sorted list
            const nextSession = sessionsCache[0];
            const otherSessions = sessionsCache.slice(1);

            updateHeroCard(nextSession);
            renderSchedule(otherSessions);
            
            DOMElements.heroSkeleton.style.display = 'none';
            DOMElements.heroContent.style.display = 'block';
        }

        function updateHeroCard(session) {
            if (!session) {
                displayNoSessionsMessage();
                return;
            }
            
            DOMElements.heroTopic.textContent = session.topic;
            DOMElements.heroSubject.textContent = session.subject;

            if (countdownInterval) clearInterval(countdownInterval);

            const updateStatus = () => {
                const now = new Date();
                const sessionTime = new Date(session.session_time);
                const diff = sessionTime - now;
                const diffMinutes = diff / (1000 * 60);

                // State Machine for Hero Card
                if (session.status === 'Live' || (diffMinutes <= 0 && diffMinutes > -60)) { // Consider live if started within the last hour
                    // LIVE STATE
                    DOMElements.heroStatusLabel.textContent = siteConfig.staticText.liveNowLabel;
                    DOMElements.heroStatusLabel.style.display = 'block';
                    DOMElements.countdown.style.display = 'none';
                    DOMElements.heroCtaButton.textContent = "انضم الآن";
                    DOMElements.heroCtaButton.href = session.session_link;
                    DOMElements.heroCtaButton.disabled = false;
                    DOMElements.heroCtaButton.classList.add('pulse');
                } else if (diffMinutes > 10) {
                    // UPCOMING STATE (> 10 mins)
                    DOMElements.heroStatusLabel.style.display = 'none';
                    DOMElements.countdown.style.display = 'block';
                    DOMElements.heroCtaButton.textContent = "قريباً...";
                    DOMElements.heroCtaButton.href = '#';
                    DOMElements.heroCtaButton.disabled = true;
                    DOMElements.heroCtaButton.classList.remove('pulse');
                    startCountdown(sessionTime);
                } else if (diffMinutes > 0 && diffMinutes <= 10) {
                    // UPCOMING STATE (< 10 mins)
                    DOMElements.heroStatusLabel.style.display = 'none';
                    DOMElements.countdown.style.display = 'block';
                    DOMElements.heroCtaButton.textContent = "استعد للإنضمام";
                    DOMElements.heroCtaButton.href = session.session_link;
                    DOMElements.heroCtaButton.disabled = false;
                    DOMElements.heroCtaButton.classList.add('pulse');
                    startCountdown(sessionTime);
                } else {
                    // ENDED STATE
                    DOMElements.heroStatusLabel.textContent = siteConfig.staticText.endedLabel;
                    DOMElements.heroStatusLabel.style.display = 'block';
                    DOMElements.countdown.style.display = 'none';
                    if (session.recording_link) {
                        DOMElements.heroCtaButton.textContent = "شاهد التسجيل";
                        DOMElements.heroCtaButton.href = session.recording_link;
                        DOMElements.heroCtaButton.disabled = false;
                    } else {
                        DOMElements.heroCtaButton.textContent = "انتهت";
                        DOMElements.heroCtaButton.href = '#';
                        DOMElements.heroCtaButton.disabled = true;
                    }
                    DOMElements.heroCtaButton.classList.remove('pulse');
                }
            };
            
            updateStatus();
            countdownInterval = setInterval(updateStatus, 1000);
        }

        function startCountdown(endTime) {
            const update = () => {
                const now = new Date().getTime();
                const distance = endTime - now;

                if (distance < 0) {
                    DOMElements.countdown.innerHTML = "00:00:00:00";
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                DOMElements.countdown.innerHTML = 
                    `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            };
            update(); // run once immediately
        }

        function renderSchedule(sessions) {
            DOMElements.scheduleGrid.innerHTML = ''; // Clear existing
            if (sessions.length === 0) {
                const p = document.createElement('p');
                p.textContent = "لا توجد حصص أخرى مجدولة حاليًا.";
                p.style.color = 'var(--text-secondary-color)';
                DOMElements.scheduleGrid.appendChild(p);
                return;
            }

            sessions.forEach(session => {
                const item = document.createElement('div');
                item.className = 'schedule-item';
                
                const sessionTime = new Date(session.session_time);
                const formattedTime = sessionTime.toLocaleString('ar-EG', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });

                let statusTagClass = 'upcoming';
                let statusText = siteConfig.staticText.upcomingLabel;
                if (session.status === 'Live') {
                    statusTagClass = 'live';
                    statusText = siteConfig.staticText.liveNowLabel;
                } else if (session.status === 'Ended') {
                    statusTagClass = 'ended';
                    statusText = siteConfig.staticText.endedLabel;
                }

                let recordingButton = '';
                if (session.status === 'Ended' && session.recording_link) {
                    recordingButton = `<a href="${session.recording_link}" class="recording-button" target="_blank">شاهد التسجيل</a>`;
                }

                item.innerHTML = `
                    <div class="status-indicator">
                        <span class="status-tag ${statusTagClass}">${statusText}</span>
                    </div>
                    <h3 class="item-topic">${session.topic}</h3>
                    <p class="item-subject">${session.subject}</p>
                    <p class="item-time">${formattedTime}</p>
                    ${recordingButton}
                `;
                DOMElements.scheduleGrid.appendChild(item);
            });
        }
        
        function displayNoSessionsMessage() {
            DOMElements.heroContent.innerHTML = `
                <h2 style="color: var(--text-secondary-color);">لا توجد حصص قادمة</h2>
                <p style="font-size: 1.2rem; margin-top: 1rem;">يرجى التحقق مرة أخرى قريبًا!</p>
            `;
            DOMElements.heroSkeleton.style.display = 'none';
            DOMElements.heroContent.style.display = 'block';
            DOMElements.scheduleGrid.innerHTML = '';
        }

        function setupRealtimeSubscription(supabase) {
            supabase
                .channel('sessions')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
                    console.log('Realtime change received!', payload);
                    // A simple but effective way to handle updates: re-fetch all data.
                    // For more complex apps, you might merge the `payload.new` data into the `sessionsCache`.
                    fetchAndRenderSessions(supabase);
                })
                .subscribe();
        }

        function displayError(message) {
            let errorDiv = document.querySelector('.error-message');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                DOMElements.appContainer.prepend(errorDiv);
            }
            errorDiv.textContent = message;
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }

        // --- Helper Functions ---
        function hslToHex(hsl) {
            let [h, s, l] = hsl.match(/\d+/g).map(Number);
            s /= 100;
            l /= 100;
            const k = n => (n + h / 30) % 12;
            const a = s * Math.min(l, 1 - l);
            const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
            return [0, 8, 4].map(n => Math.round(f(n) * 255).toString(16).padStart(2, '0')).join('');
        }

        function hexToRgb(hex) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        // Run the app
        main();
