if (sessionStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Import Supabase client and the site configuration from the main script
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// This configuration is copied from your `script.js`.
// For a real-world app, you might share this from a single source file.
const siteConfig = {
    supabase: {
        url: 'https://dosjygvqyoyubqechstd.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc2p5Z3ZxeW95dWJxZWNoc3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzYyNzAsImV4cCI6MjA3MzAxMjI3MH0.dX0MCL94EsX4vbOpWFNL6PHZlr50FT6TI4Jh2CKIGAo'
    },
    theme: {
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
        font: {
            primary: "'Inter', sans-serif",
        }
    }
};

// DOM Elements
const DOMElements = {
    root: document.documentElement,
    form: document.getElementById('session-form'),
    formTitle: document.getElementById('form-title'),
    sessionId: document.getElementById('session-id'),
    topic: document.getElementById('topic'),
    subject: document.getElementById('subject'),
    sessionTime: document.getElementById('session_time'),
    status: document.getElementById('status'),
    sessionLink: document.getElementById('session_link'),
    recordingLink: document.getElementById('recording_link'),
    saveButton: document.getElementById('save-button'),
    cancelButton: document.getElementById('cancel-button'),
    sessionsTbody: document.getElementById('sessions-tbody'),
};

let supabase;

// Main App Logic
function main() {
    applyTheme();
    try {
        supabase = initializeSupabase();
        loadSessions();
        setupEventListeners();
    } catch (error) {
        console.error("Initialization failed:", error);
        alert("فشل الاتصال بالخادم. يرجى التحقق من الإعدادات.");
    }
}

function applyTheme() {
    const { colors, font } = siteConfig.theme;
    DOMElements.root.style.setProperty('--background-color', colors.background);
    DOMElements.root.style.setProperty('--primary-color', colors.primary);
    DOMElements.root.style.setProperty('--accent-color', colors.accent);
    DOMElements.root.style.setProperty('--card-background-color', colors.cardBackground);
    DOMElements.root.style.setProperty('--card-border-color', colors.cardBorder);
    DOMElements.root.style.setProperty('--text-primary-color', colors.textPrimary);
    DOMElements.root.style.setProperty('--text-secondary-color', colors.textSecondary);
    DOMElements.root.style.setProperty('--success-color', colors.success);
    DOMElements.root.style.setProperty('--font-primary', font.primary);
    
    const primaryRgb = hexToRgb(hslToHex(colors.primary));
    const accentRgb = hexToRgb(hslToHex(colors.accent));
    DOMElements.root.style.setProperty('--primary-color-alpha', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`);
    DOMElements.root.style.setProperty('--accent-color-alpha', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.5)`);
}

function initializeSupabase() {
    const { url, anonKey } = siteConfig.supabase;
    if (!url || !anonKey) {
        throw new Error("Supabase credentials are not configured.");
    }
    return createClient(url, anonKey);
}

function setupEventListeners() {
    DOMElements.form.addEventListener('submit', handleFormSubmit);
    DOMElements.cancelButton.addEventListener('click', resetForm);
}

async function loadSessions() {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('session_time', { ascending: false });

    if (error) {
        console.error("Error fetching sessions:", error);
        alert("حدث خطأ أثناء جلب الحصص.");
        return;
    }

    renderTable(data);
}

function renderTable(sessions) {
    DOMElements.sessionsTbody.innerHTML = '';
    if (sessions.length === 0) {
        DOMElements.sessionsTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد حصص لعرضها.</td></tr>';
        return;
    }

    sessions.forEach(session => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${session.topic}</td>
            <td>${session.subject}</td>
            <td>${new Date(session.session_time).toLocaleString('ar-EG')}</td>
            <td><span class="status-tag ${session.status}">${session.status}</span></td>
            <td class="actions-cell">
                <button class="action-button edit-btn" data-id="${session.id}">تعديل</button>
                <button class="action-button delete-btn" data-id="${session.id}">حذف</button>
            </td>
        `;
        DOMElements.sessionsTbody.appendChild(tr);
    });

    // Add event listeners for new buttons
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => handleEdit(btn.dataset.id, sessions)));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => handleDelete(btn.dataset.id)));
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = DOMElements.sessionId.value;
    const sessionData = {
        topic: DOMElements.topic.value,
        subject: DOMElements.subject.value,
        session_time: DOMElements.sessionTime.value,
        status: DOMElements.status.value,
        session_link: DOMElements.sessionLink.value || null,
        recording_link: DOMElements.recordingLink.value || null,
    };

    let result;
    if (id) { // Update
        result = await supabase.from('sessions').update(sessionData).eq('id', id);
    } else { // Insert
        result = await supabase.from('sessions').insert([sessionData]);
    }

    if (result.error) {
        console.error("Error saving session:", result.error);
        alert("فشل حفظ الحصة.");
    } else {
        resetForm();
        loadSessions();
    }
}

function handleEdit(id, sessions) {
    const session = sessions.find(s => s.id == id);
    if (!session) return;

    DOMElements.sessionId.value = session.id;
    DOMElements.topic.value = session.topic;
    DOMElements.subject.value = session.subject;
    // Format date for datetime-local input
    const date = new Date(session.session_time);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    DOMElements.sessionTime.value = date.toISOString().slice(0, 16);
    DOMElements.status.value = session.status;
    DOMElements.sessionLink.value = session.session_link || '';
    DOMElements.recordingLink.value = session.recording_link || '';

    DOMElements.formTitle.textContent = 'تعديل الحصة';
    DOMElements.cancelButton.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleDelete(id) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذه الحصة؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }

    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) {
        console.error("Error deleting session:", error);
        alert("فشل حذف الحصة.");
    } else {
        loadSessions();
    }
}

function resetForm() {
    DOMElements.form.reset();
    DOMElements.sessionId.value = '';
    DOMElements.formTitle.textContent = 'إضافة حصة جديدة';
    DOMElements.cancelButton.style.display = 'none';
}

// --- Helper Functions from main script ---
function hslToHex(hsl) {
    let [h, s, l] = hsl.match(/\d+/g).map(Number);
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [0, 8, 4].map(n => Math.round(f(n) * 255).toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.startsWith('#') ? hex : `#${hex}`);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

// Run the app
main();