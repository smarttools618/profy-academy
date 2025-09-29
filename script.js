document.addEventListener('DOMContentLoaded', function () {
    const { jsPDF } = window.jspdf;
    const JSZip = window.JSZip;

    // --- DOM Elements ---
    const teacherNameInput = document.getElementById('teacherName');
    const subjectInput = document.getElementById('subject');
    const lessonTitleInput = document.getElementById('lessonTitle');
    const gradeLevelSelect = document.getElementById('gradeLevel');
    const mainTitleInput = document.getElementById('mainTitle');
    const textDirectionSelect = document.getElementById('textDirection');
    const docxFileInput = document.getElementById('docxFile');
    const watermarkFileInput = document.getElementById('watermarkFile');
    const generateBtn = document.getElementById('generateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const loaderOverlay = document.getElementById('loader-overlay');
    const langSelect = document.getElementById('lang-select');

    // --- Output Elements ---
    const outputTeacher = document.getElementById('output-teacher');
    const outputSubject = document.getElementById('output-subject');
    const outputLesson = document.getElementById('output-lesson');
    const outputGrade = document.getElementById('output-grade');
    const outputMainTitle = document.getElementById('output-main-title');
    const contentOutput = document.getElementById('content-output');
    const watermarkOverlay = document.getElementById('watermark-overlay');

    let gradeMap = {};

    const footerPhoneInput = document.getElementById('footerPhone');
    const footerEmailInput = document.getElementById('footerEmail');
    const optIncludePageNumbers = document.getElementById('optIncludePageNumbers');
    const optUseDocxTheme = document.getElementById('optUseDocxTheme');
    const optHighResPdf = document.getElementById('optHighResPdf');

    // --- Translations ---
    const translations = {
        ar: {
            title: 'مولد القوالب التعليمية الاحترافي',
            creatingPdf: 'جاري إنشاء ملف PDF...',
            templateSettings: 'إعدادات القالب',
            teacherName: 'اسم الأستاذ:',
            teacherNamePlaceholder: 'مثال: نجيب المستوري',
            subject: 'المادة:',
            subjectPlaceholder: 'مثال: الفرنسية',
            lessonTitle: 'عنوان الدرس:',
            lessonTitlePlaceholder: 'مثال: Production-écrite',
            gradeLevel: 'المستوى الدراسي:',
            textDirection: 'اتجاه محتوى الملف:',
            mainTitle: 'العنوان الرئيسي (اختياري):',
            mainTitlePlaceholder: 'مثال: préparons-nous à la 4ème année',
            docxFile: 'اختر ملف Word (.docx):',
            watermarkFile: 'اختر صورة العلامة المائية (اختياري):',
            footerPhone: 'رقم الهاتف في التذييل:',
            footerPhonePlaceholder: 'مثال: 98748831',
            footerEmail: 'البريد الإلكتروني في التذييل:',
            footerEmailPlaceholder: 'مثال: sanaalbouchi@gmail.com',
            advancedOptions: 'خيارات متقدمة:',
            includePageNumbers: 'تضمين أرقام الصفحات',
            useDocxTheme: 'استخدام ألوان ملف Word (إن وُجدت)',
            highResPdf: 'PDF عالِ الدقة (مضاعف التحجيم)',
            generateTemplate: 'إنشاء القالب',
            saveAsPdf: 'حفظ كملف PDF',
            pagePreview: 'معاينة الصفحات:',
            teacher: 'الأستاذ :',
            lesson: 'الدرس',
            subjectPill: 'المادة',
            contentPlaceholder: 'سيتم عرض المحتوى هنا بعد اختيار الملف أو إدخال المعلومات',
            gradeMap: {
                '1': 'السنة الأولى', '2': 'السنة الثانية', '3': 'السنة الثالثة',
                '4': 'السنة الرابعة', '5': 'السنة الخامسة', '6': 'السنة السادسة',
                '7': 'السنة السابعة', '8': 'السنة الثامنة', '9': 'السنة التاسعة'
            }
        },
        fr: {
            title: 'Générateur de Modèles Éducatifs Professionnel',
            creatingPdf: 'Création du PDF en cours...',
            templateSettings: 'Paramètres du Modèle',
            teacherName: 'Nom de l\'enseignant:',
            teacherNamePlaceholder: 'Ex: Najib El Moustouri',
            subject: 'Matière:',
            subjectPlaceholder: 'Ex: Français',
            lessonTitle: 'Titre de la leçon:',
            lessonTitlePlaceholder: 'Ex: Production-écrite',
            gradeLevel: 'Niveau scolaire:',
            textDirection: 'Direction du contenu:',
            mainTitle: 'Titre principal (optionnel):',
            mainTitlePlaceholder: 'Ex: préparons-nous à la 4ème année',
            docxFile: 'Choisir un fichier Word (.docx):',
            watermarkFile: 'Choisir une image de filigrane (optionnel):',
            footerPhone: 'Téléphone (pied de page):',
            footerPhonePlaceholder: 'Ex: 98748831',
            footerEmail: 'Email (pied de page):',
            footerEmailPlaceholder: 'Ex: sanaalbouchi@gmail.com',
            advancedOptions: 'Options avancées:',
            includePageNumbers: 'Inclure les numéros de page',
            useDocxTheme: 'Utiliser les couleurs du document Word (si disponibles)',
            highResPdf: 'PDF haute résolution (échelle x2)',
            generateTemplate: 'Générer le Modèle',
            saveAsPdf: 'Enregistrer en PDF',
            pagePreview: 'Aperçu des pages:',
            teacher: 'Enseignant :',
            lesson: 'Leçon',
            subjectPill: 'Matière',
            contentPlaceholder: 'Le contenu sera affiché ici après avoir choisi un fichier ou saisi les informations.',
            gradeMap: {
                '1': '1ère Année', '2': '2ème Année', '3': '3ème Année',
                '4': '4ème Année', '5': '5ème Année', '6': '6ème Année',
                '7': '7ème Année', '8': '8ème Année', '9': '9ème Année'
            }
        },
        en: {
            title: 'Professional Educational Template Generator',
            creatingPdf: 'Creating PDF...',
            templateSettings: 'Template Settings',
            teacherName: 'Teacher\'s Name:',
            teacherNamePlaceholder: 'Ex: John Doe',
            subject: 'Subject:',
            subjectPlaceholder: 'Ex: French',
            lessonTitle: 'Lesson Title:',
            lessonTitlePlaceholder: 'Ex: Written Production',
            gradeLevel: 'Grade Level:',
            textDirection: 'Content Direction:',
            mainTitle: 'Main Title (optional):',
            mainTitlePlaceholder: 'Ex: Preparing for Grade 4',
            docxFile: 'Choose a Word file (.docx):',
            watermarkFile: 'Choose a watermark image (optional):',
            footerPhone: 'Footer Phone:',
            footerPhonePlaceholder: 'Ex: 123456789',
            footerEmail: 'Footer Email:',
            footerEmailPlaceholder: 'Ex: example@email.com',
            advancedOptions: 'Advanced Options:',
            includePageNumbers: 'Include page numbers',
            useDocxTheme: 'Use colors from Word file (if available)',
            highResPdf: 'High-Resolution PDF (2x scaling)',
            generateTemplate: 'Generate Template',
            saveAsPdf: 'Save as PDF',
            pagePreview: 'Page Preview:',
            teacher: 'Teacher:',
            lesson: 'Lesson',
            subjectPill: 'Subject',
            contentPlaceholder: 'Content will be displayed here after selecting a file or entering information.',
            gradeMap: {
                '1': '1st Grade', '2': '2nd Grade', '3': '3rd Grade',
                '4': '4th Grade', '5': '5th Grade', '6': '6th Grade',
                '7': '7th Grade', '8': '8th Grade', '9': '9th Grade'
            }
        }
    };

    // --- Functions ---
    function setLanguage(lang) {
        const t = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.title = t.title;

        document.querySelector('#loader-overlay p').textContent = t.creatingPdf;
        document.querySelector('.controls-container h2').textContent = t.templateSettings;
        
        const labels = {
            teacherName: t.teacherName,
            subject: t.subject,
            lessonTitle: t.lessonTitle,
            gradeLevel: t.gradeLevel,
            textDirection: t.textDirection,
            mainTitle: t.mainTitle,
            docxFile: t.docxFile,
            watermarkFile: t.watermarkFile,
            footerPhone: t.footerPhone,
            footerEmail: t.footerEmail,
            'lang-select': 'Language:'
        };
        for (const key in labels) {
            document.querySelector(`label[for='${key}']`).textContent = labels[key];
        }

        teacherNameInput.placeholder = t.teacherNamePlaceholder;
        subjectInput.placeholder = t.subjectPlaceholder;
        lessonTitleInput.placeholder = t.lessonTitlePlaceholder;
        mainTitleInput.placeholder = t.mainTitlePlaceholder;
        footerPhoneInput.placeholder = t.footerPhonePlaceholder;
        footerEmailInput.placeholder = t.footerEmailPlaceholder;

        document.querySelector('.form-group label:last-of-type').textContent = t.advancedOptions;
        document.querySelector('label[for="optIncludePageNumbers"]').innerHTML = `<input type="checkbox" id="optIncludePageNumbers" checked> ${t.includePageNumbers}`;
        document.querySelector('label[for="optUseDocxTheme"]').innerHTML = `<input type="checkbox" id="optUseDocxTheme" checked> ${t.useDocxTheme}`;
        document.querySelector('label[for="optHighResPdf"]').innerHTML = `<input type="checkbox" id="optHighResPdf" checked> ${t.highResPdf}`;

        generateBtn.textContent = t.generateTemplate;
        downloadPdfBtn.textContent = t.saveAsPdf;

        document.querySelector('.controls-meta div').innerHTML = `${t.pagePreview} <span id="pageCount">1</span>`;
        document.querySelector('.header-info.right').innerHTML = `${t.teacher} <span id="output-teacher"></span>`;
        document.querySelector('.pill-title').textContent = t.lesson;
        document.querySelectorAll('.pill-title')[1].textContent = t.subjectPill;
        document.querySelector('#content-wrapper p').textContent = t.contentPlaceholder;

        gradeMap = t.gradeMap;
        const currentGrade = gradeLevelSelect.value;
        gradeLevelSelect.innerHTML = Object.keys(gradeMap).map(key => `<option value="${key}">${gradeMap[key]}</option>`).join('');
        gradeLevelSelect.value = currentGrade;
        updateHeaderPreview();
    }

    function handleWatermarkChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                watermarkOverlay.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(file);
        } else {
            watermarkOverlay.style.backgroundImage = 'none';
        }
    }

    function updateHeaderPreview() {
        outputTeacher.textContent = teacherNameInput.value || '...';
        outputSubject.textContent = subjectInput.value || '...';
        outputLesson.textContent = lessonTitleInput.value || '...';
        outputMainTitle.textContent = mainTitleInput.value || '';
        outputGrade.textContent = gradeMap[gradeLevelSelect.value] || '...';
        document.getElementById('footer-phone-output').textContent = footerPhoneInput.value;
        document.getElementById('footer-email-output').textContent = footerEmailInput.value;
    }

    function handleTextDirectionChange() {
        updateHeaderPreview();
        const direction = textDirectionSelect.value;
        contentOutput.className = (direction === 'rtl' ? 'direction-rtl' : 'direction-ltr');
    }

    async function handleDocxFileChange() {
        const file = docxFileInput.files[0];
        if (file) {
            loaderOverlay.style.display = 'flex';
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const options = {
                        styleMap: [
                            "p[style-name='Section Title'] => h1:fresh",
                            "p[style-name='Subsection Title'] => h2:fresh",
                        ],
                    };
                    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
                    document.getElementById('content-wrapper').innerHTML = result.value;
                    if (result.messages && result.messages.length) console.warn('Mammoth messages:', result.messages);

                    if (optUseDocxTheme && optUseDocxTheme.checked) await extractDocxColors(arrayBuffer);
                    updateHeaderPreview();
                    await updatePageCountPreview();
                } catch (err) {
                    console.error('Error converting .docx file:', err);
                    document.getElementById('content-wrapper').innerHTML = `<p style="color:red; text-align:center;">Error converting file: ${err.message}</p>`;
                } finally {
                    loaderOverlay.style.display = 'none';
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }

    function handleGenerateClick() {
        if (docxFileInput.files[0]) {
            docxFileInput.dispatchEvent(new Event('change'));
        } else {
            updateHeaderPreview();
            updatePageCountPreview();
        }
    }

    async function generatePdf() {
        const elementToCapture = document.getElementById('page-container');
        const lessonTitle = lessonTitleInput.value || 'document';

        loaderOverlay.style.display = 'flex';
        const scale = (optHighResPdf && optHighResPdf.checked) ? 2 : 1.4;

        try {
            const canvas = await html2canvas(elementToCapture, { scale, useCORS: true, logging: false });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidthMm = pdf.internal.pageSize.getWidth();
            const pageHeightMm = pdf.internal.pageSize.getHeight();

            const pxPerMm = canvas.width / pageWidthMm;
            const marginTopMm = 16;
            const marginBottomMm = 20;
            const usablePageHeightMm = pageHeightMm - marginTopMm - marginBottomMm;
            const pageHeightPx = Math.floor(usablePageHeightMm * pxPerMm);

            let remainingHeight = canvas.height;
            let pageY = 0;
            let pageIndex = 0;

            while (remainingHeight > 0) {
                const tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = canvas.width;
                tmpCanvas.height = Math.min(pageHeightPx, remainingHeight);
                const ctx = tmpCanvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
                ctx.drawImage(canvas, 0, pageY, canvas.width, tmpCanvas.height, 0, 0, canvas.width, tmpCanvas.height);

                const imgData = tmpCanvas.toDataURL('image/png');
                const imgHeightMm = tmpCanvas.height / pxPerMm;

                if (pageIndex > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, marginTopMm, pageWidthMm, imgHeightMm);

                addPdfFooter(pdf, pageIndex, pageWidthMm, pageHeightMm);

                remainingHeight -= tmpCanvas.height;
                pageY += tmpCanvas.height;
                pageIndex++;
            }

            pdf.save(`${lessonTitle}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Error generating PDF. Please check the console.');
        } finally {
            loaderOverlay.style.display = 'none';
        }
    }

    function addPdfFooter(pdf, pageIndex, pageWidthMm, pageHeightMm) {
        const footerPhone = footerPhoneInput.value || '98748831';
        const footerEmail = footerEmailInput.value || 'sanaalbouchi@gmail.com';
        const footerY = pageHeightMm - 10;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(footerPhone, 16, footerY);
        pdf.text(footerEmail, 60, footerY);

        if (!optIncludePageNumbers || optIncludePageNumbers.checked) {
            const pageNumX = pageWidthMm - 16;
            const pageNumY = pageHeightMm - 12;
            const pageNumberStr = String(pageIndex + 1);
            const fillColor = getComputedStyle(document.documentElement).getPropertyValue('--docx-primary') || '#1f2a4f';
            pdf.setFillColor(...hexToRgbArray(fillColor));
            pdf.circle(pageNumX, pageNumY, 7.5, 'F');
            pdf.setFontSize(11);
            pdf.setTextColor(255, 255, 255);
            pdf.text(pageNumberStr, pageNumX, pageNumY + 3, { align: 'center', baseline: 'middle' });
        }
    }

    async function extractDocxColors(arrayBuffer) {
        if (!JSZip) throw new Error('JSZip not loaded');
        const zip = await JSZip.loadAsync(arrayBuffer);
        const themeFile = zip.file('word/theme/theme1.xml');
        if (!themeFile) return;

        const xmlText = await themeFile.async('text');
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'application/xml');

        const srgb = xml.getElementsByTagName('a:srgbClr');
        if (srgb && srgb.length > 0) {
            const val = srgb[0].getAttribute('val');
            if (val) {
                document.documentElement.style.setProperty('--docx-primary', `#${val}`);
            }
            if (srgb.length > 1) {
                const val2 = srgb[1].getAttribute('val');
                if (val2) document.documentElement.style.setProperty('--docx-accent', `#${val2}`);
            }
        }
    }

    function hexToRgbArray(hex) {
        let h = hex.replace('#', '').trim();
        if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
        const bigint = parseInt(h, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }

    async function updatePageCountPreview() {
        try {
            const container = document.getElementById('page-container');
            const canvas = await html2canvas(container, { scale: 1, useCORS: true });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidthMm = pdf.internal.pageSize.getWidth();
            const pxPerMm = canvas.width / pageWidthMm;
            const pageHeightPx = pdf.internal.pageSize.getHeight() * pxPerMm;
            const count = Math.max(1, Math.ceil(canvas.height / pageHeightPx));
            document.getElementById('pageCount').textContent = count;

            const multi = document.getElementById('multiPreview');
            if (!multi) return;
            multi.innerHTML = '';
            let remaining = canvas.height;
            let y = 0;
            let idx = 0;
            const docxPrimary = getComputedStyle(document.documentElement).getPropertyValue('--docx-primary').trim() || '#1f2a4f';
            while (remaining > 0) {
                const h = Math.min(pageHeightPx, remaining);
                const tmp = document.createElement('canvas');
                tmp.width = canvas.width;
                tmp.height = h;
                const ctx = tmp.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, tmp.width, tmp.height);
                ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, tmp.width, tmp.height);

                const img = new Image();
                img.src = tmp.toDataURL('image/png');
                img.style.width = '100%';
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-page';
                wrapper.appendChild(img);

                const footer = document.createElement('div');
                footer.className = 'preview-footer';
                footer.innerHTML = `<div class="contact-info"><span>&#9742;</span> ${footerPhoneInput.value}</div><div class="contact-info"><span>&#9993;</span> ${footerEmailInput.value}</div>`;
                wrapper.appendChild(footer);

                const pnum = document.createElement('div');
                pnum.className = 'preview-page-number';
                pnum.style.background = docxPrimary;
                pnum.textContent = String(idx + 1);
                wrapper.appendChild(pnum);

                multi.appendChild(wrapper);

                remaining -= h;
                y += h;
                idx++;
            }
        } catch (e) {
            console.warn('Could not compute page count:', e);
        }
    }

    // --- Event Listeners ---
    watermarkFileInput.addEventListener('change', handleWatermarkChange);
    [teacherNameInput, subjectInput, lessonTitleInput, mainTitleInput, footerPhoneInput, footerEmailInput].forEach(el => {
        el.addEventListener('input', updateHeaderPreview);
    });
    gradeLevelSelect.addEventListener('change', updateHeaderPreview);
    textDirectionSelect.addEventListener('change', handleTextDirectionChange);
    docxFileInput.addEventListener('change', handleDocxFileChange);
    generateBtn.addEventListener('click', handleGenerateClick);
    downloadPdfBtn.addEventListener('click', generatePdf);
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));

    // --- Initial Setup ---
    setLanguage('ar'); // Set default language to Arabic
    updateHeaderPreview();
});
