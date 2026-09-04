// Global State
let cvData = {};
let suratData = {};
let currentProfile = 'technology';
let activeTab = 'cv';
let isEditMode = false;

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        loadAllData();
    } else {
        document.getElementById('login-modal').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }
    
    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById('login-password').value;
    if (passwordInput === 'rizky2026' || passwordInput === 'admin123') {
        sessionStorage.setItem('isLoggedIn', 'true');
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        loadAllData();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

// Handle Logout
function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.reload();
}

// Load Data from JSON files
async function loadAllData() {
    try {
        const [resCv, resSurat] = await Promise.all([
            fetch('data.json'),
            fetch('surat.json')
        ]);
        cvData = await resCv.json();
        suratData = await resSurat.json();

        renderProfileTabs();
        renderCV();
        renderSurat();
    } catch (err) {
        console.error('Gagal memuat data JSON:', err);
        alert('Gagal memuat data dari file JSON. Pastikan Anda menjalankan web server lokal (seperti Live Server atau Python http.server).');
    }
}

// Render Profile Tabs for CV
function renderProfileTabs() {
    const tabsContainer = document.getElementById('profile-tabs');
    if (!tabsContainer || !cvData.profiles) return;

    let html = '';
    for (const key in cvData.profiles) {
        const profile = cvData.profiles[key];
        const isActive = key === currentProfile;
        const activeClass = isActive ? 'bg-blue-600 text-white shadow' : 'bg-slate-700 text-slate-300 hover:bg-slate-600';
        html += `
            <button onclick="switchProfile('${key}')" class="px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeClass}">
                <i class="${profile.icon || 'fas fa-user'} mr-1.5"></i> ${profile.label}
            </button>
        `;
    }
    tabsContainer.innerHTML = html;
}

// Switch Profile
function switchProfile(profileKey) {
    currentProfile = profileKey;
    renderProfileTabs();
    renderCV();
}

// Switch Main Tab (CV vs Surat Lamaran)
function switchTab(tab) {
    activeTab = tab;
    const sectionCv = document.getElementById('section-cv');
    const sectionSurat = document.getElementById('section-surat');
    const btnCv = document.getElementById('btn-tab-cv');
    const btnSurat = document.getElementById('btn-tab-surat');
    const profileTabs = document.getElementById('profile-tabs').parentElement;

    if (tab === 'cv') {
        sectionCv.classList.remove('hidden');
        sectionSurat.classList.add('hidden');
        if (profileTabs) profileTabs.classList.remove('hidden');
        btnCv.className = "px-6 py-2.5 rounded-xl font-semibold bg-blue-600 text-white shadow-md transition flex items-center gap-2";
        btnSurat.className = "px-6 py-2.5 rounded-xl font-semibold bg-white text-gray-700 hover:bg-gray-200 shadow-sm border border-gray-300 transition flex items-center gap-2";
    } else {
        sectionCv.classList.add('hidden');
        sectionSurat.classList.remove('hidden');
        if (profileTabs) profileTabs.classList.add('hidden');
        btnSurat.className = "px-6 py-2.5 rounded-xl font-semibold bg-blue-600 text-white shadow-md transition flex items-center gap-2";
        btnCv.className = "px-6 py-2.5 rounded-xl font-semibold bg-white text-gray-700 hover:bg-gray-200 shadow-sm border border-gray-300 transition flex items-center gap-2";
    }
}

// Toggle Edit Mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btnEdit = document.getElementById('btn-edit-mode');
    const textEdit = document.getElementById('edit-mode-text');
    const btnSaveJson = document.getElementById('btn-save-json');

    if (isEditMode) {
        btnEdit.className = "px-3.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5";
        textEdit.textContent = "Mode Edit: ON";
        btnSaveJson.classList.remove('hidden');
        btnSaveJson.classList.add('flex');
    } else {
        btnEdit.className = "px-3.5 py-1.5 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1.5";
        textEdit.textContent = "Mode Edit: OFF";
        btnSaveJson.classList.add('hidden');
        btnSaveJson.classList.remove('flex');
        
        // Sync data from DOM before exiting edit mode
        syncDomToData();
    }

    renderCV();
    renderSurat();
}

// Sync DOM changes back to JS objects when exiting edit mode
function syncDomToData() {
    if (activeTab === 'cv') {
        const container = document.getElementById('cv-container');
        if (!container) return;
        const profile = cvData.profiles[currentProfile];
        
        const nameEl = container.querySelector('[data-field="name"]');
        if (nameEl) profile.name = nameEl.innerText.trim();

        const titleEl = container.querySelector('[data-field="title"]');
        if (titleEl) profile.title = titleEl.innerText.trim();

        const locationEl = container.querySelector('[data-field="location"]');
        if (locationEl) profile.location = locationEl.innerText.trim();

        const emailEl = container.querySelector('[data-field="email"]');
        if (emailEl) profile.email = emailEl.innerText.trim();

        const phoneEl = container.querySelector('[data-field="phone"]');
        if (phoneEl) profile.phone = phoneEl.innerText.trim();

        const summaryEl = container.querySelector('[data-field="summary"]');
        if (summaryEl) profile.summary = summaryEl.innerText.trim();
    } else {
        const container = document.getElementById('surat-container');
        if (!container || !suratData) return;

        const getVal = (field) => {
            const el = container.querySelector(`[data-field="${field}"]`);
            return el ? el.innerText.trim() : '';
        };

        suratData.lampiran = getVal('lampiran');
        suratData.perihal = getVal('perihal');
        suratData.city = getVal('city');
        suratData.date = getVal('date');
        suratData.tujuanKepada = getVal('tujuanKepada');
        suratData.tujuanNama = getVal('tujuanNama');
        suratData.tujuanAlamat = getVal('tujuanAlamat');
        suratData.salamPembuka = getVal('salamPembuka');
        suratData.paragrafPembuka = getVal('paragrafPembuka');
        suratData.labelDataDiri = getVal('labelDataDiri');
        suratData.lampiranHeader = getVal('lampiranHeader');
        suratData.paragrafPenutup = getVal('paragrafPenutup');
        suratData.salamPenutup = getVal('salamPenutup');
        suratData.signatureName = getVal('signatureName');

        // Personal Info table rows
        const rows = container.querySelectorAll('table tr');
        rows.forEach((tr, index) => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 3 && suratData.personalInfo[index]) {
                suratData.personalInfo[index].value = tds[2].innerText.trim();
            }
        });

        // Body Paragraphs
        const bodyPs = container.querySelectorAll('.surat-body-p');
        bodyPs.forEach((p, index) => {
            if (suratData.bodyParagraphs[index] !== undefined) {
                suratData.bodyParagraphs[index] = p.innerText.trim();
            }
        });
    }
}

// Render CV
function renderCV() {
    const container = document.getElementById('cv-container');
    if (!container || !cvData.profiles) return;
    const p = cvData.profiles[currentProfile];
    if (!p) return;

    let skillsHtml = '';
    if (p.skills) {
        p.skills.forEach(cat => {
            skillsHtml += `
                <div class="mb-3">
                    <h4 class="font-bold text-gray-900 text-sm mb-1"><i class="fas fa-check-circle text-blue-600 mr-1.5"></i>${cat.category}</h4>
                    <p class="text-sm text-gray-700 pl-5" contenteditable="${isEditMode}">${cat.description}</p>
                </div>
            `;
        });
    }

    let expHtml = '';
    if (p.experience) {
        p.experience.forEach((exp, idx) => {
            let bulletsHtml = exp.bullets.map(b => `<li class="mb-1" contenteditable="${isEditMode}">${b}</li>`).join('');
            expHtml += `
                <div class="mb-5">
                    <div class="flex flex-wrap justify-between items-baseline">
                        <h4 class="font-bold text-gray-900 text-base" contenteditable="${isEditMode}">${exp.company}</h4>
                        <span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded" contenteditable="${isEditMode}">${exp.period}</span>
                    </div>
                    <div class="text-sm font-semibold text-gray-700 mb-1" contenteditable="${isEditMode}">${exp.role}</div>
                    <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        ${bulletsHtml}
                    </ul>
                </div>
            `;
        });
    }

    let orgHtml = '';
    if (p.organization) {
        p.organization.forEach((org, idx) => {
            let bulletsHtml = org.bullets.map(b => `<li class="mb-1" contenteditable="${isEditMode}">${b}</li>`).join('');
            orgHtml += `
                <div class="mb-4">
                    <div class="flex flex-wrap justify-between items-baseline">
                        <h4 class="font-bold text-gray-900 text-base" contenteditable="${isEditMode}">${org.name}</h4>
                        <span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded" contenteditable="${isEditMode}">${org.period}</span>
                    </div>
                    <div class="text-sm font-semibold text-gray-700 mb-1" contenteditable="${isEditMode}">${org.role}</div>
                    <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        ${bulletsHtml}
                    </ul>
                </div>
            `;
        });
    }

    let eduHtml = '';
    if (p.education) {
        p.education.forEach((edu, idx) => {
            eduHtml += `
                <div class="mb-3">
                    <div class="flex flex-wrap justify-between items-baseline">
                        <h4 class="font-bold text-gray-900 text-base" contenteditable="${isEditMode}">${edu.institution}</h4>
                        <span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded" contenteditable="${isEditMode}">${edu.period}</span>
                    </div>
                    <p class="text-sm text-gray-700" contenteditable="${isEditMode}">${edu.degree}</p>
                </div>
            `;
        });
    }

    let certHtml = '';
    if (p.certifications) {
        p.certifications.forEach((cert, idx) => {
            certHtml += `<li class="text-sm text-gray-700 mb-1" contenteditable="${isEditMode}">${cert}</li>`;
        });
    }

    container.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 pb-6 mb-6 gap-6">
            <div class="space-y-2">
                <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" contenteditable="${isEditMode}" data-field="name">${p.name}</h1>
                <h2 class="text-lg font-bold text-blue-600 uppercase tracking-wide" contenteditable="${isEditMode}" data-field="title">${p.title}</h2>
                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-1">
                    <span><i class="fas fa-map-marker-alt text-rose-500 mr-1.5"></i><span contenteditable="${isEditMode}" data-field="location">${p.location}</span></span>
                    <span><i class="fas fa-envelope text-blue-500 mr-1.5"></i><span contenteditable="${isEditMode}" data-field="email">${p.email}</span></span>
                    <span><i class="fas fa-phone text-emerald-500 mr-1.5"></i><span contenteditable="${isEditMode}" data-field="phone">${p.phone}</span></span>
                    ${p.portfolio ? `<span><i class="fas fa-globe text-indigo-500 mr-1.5"></i><a href="${p.portfolio}" target="_blank" class="hover:underline text-blue-600">${p.portfolio}</a></span>` : ''}
                </div>
            </div>
            <div class="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-md border-2 border-slate-200 flex-shrink-0 bg-slate-100">
                <img src="${p.photo || 'asset/46 biru.jpg'}" alt="Pasfoto" class="w-full h-full object-cover">
            </div>
        </div>

        <div class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
                <i class="fas fa-user-tie text-blue-600"></i> Ringkasan Profil Executive
            </h3>
            <p class="text-sm text-gray-700 text-justify leading-relaxed" contenteditable="${isEditMode}" data-field="summary">${p.summary}</p>
        </div>

        <div class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
                <i class="fas fa-tools text-blue-600"></i> Keahlian Utama & Kompetensi
            </h3>
            ${skillsHtml}
        </div>

        ${p.experience && p.experience.length > 0 ? `
        <div class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
                <i class="fas fa-briefcase text-blue-600"></i> Pengalaman Kerja
            </h3>
            ${expHtml}
        </div>` : ''}

        ${p.organization && p.organization.length > 0 ? `
        <div class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
                <i class="fas fa-users text-blue-600"></i> Pengalaman Organisasi
            </h3>
            ${orgHtml}
        </div>` : ''}

        <div class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
                <i class="fas fa-graduation-cap text-blue-600"></i> Pendidikan Formal
            </h3>
            ${eduHtml}
        </div>

        ${p.certifications && p.certifications.length > 0 ? `
        <div class="mb-2">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
                <i class="fas fa-certificate text-blue-600"></i> Sertifikasi Resmi
            </h3>
            <ul class="list-disc pl-5">
                ${certHtml}
            </ul>
        </div>` : ''}
    `;
}

// Render Surat Lamaran
function renderSurat() {
    const container = document.getElementById('surat-container');
    if (!container || !suratData) return;

    let attachmentsHtml = suratData.attachments.map((item, idx) => `<li class="mb-1">${idx + 1}. ${item}</li>`).join('');
    
    let personalInfoHtml = suratData.personalInfo.map(info => `
        <tr>
            <td class="py-1 pr-4 font-medium w-44">${info.label}</td>
            <td class="py-1 pr-2">:</td>
            <td class="py-1" contenteditable="${isEditMode}">${info.value}</td>
        </tr>
    `).join('');

    let bodyHtml = suratData.bodyParagraphs.map((p, idx) => `
        <p class="mb-4 text-justify surat-body-p" contenteditable="${isEditMode}" data-body-idx="${idx}">${p}</p>
    `).join('');

    container.innerHTML = `
        <div class="flex justify-between items-start mb-6 text-sm">
            <div>
                <span contenteditable="${isEditMode}" data-field="lampiran">Lampiran: ${suratData.lampiran}</span><br>
                <span contenteditable="${isEditMode}" data-field="perihal">Perihal: ${suratData.perihal}</span>
            </div>
            <div class="text-right">
                <span contenteditable="${isEditMode}" data-field="city">${suratData.city}</span>, <span contenteditable="${isEditMode}" data-field="date">${suratData.date}</span>
            </div>
        </div>

        <div class="mb-6 text-sm">
            <p contenteditable="${isEditMode}" data-field="tujuanKepada">${suratData.tujuanKepada}</p>
            <p class="font-semibold" contenteditable="${isEditMode}" data-field="tujuanNama">${suratData.tujuanNama}</p>
            <p contenteditable="${isEditMode}" data-field="tujuanAlamat">${suratData.tujuanAlamat}</p>
        </div>

        <div class="mb-4 text-sm">
            <p class="mb-3" contenteditable="${isEditMode}" data-field="salamPembuka">${suratData.salamPembuka}</p>
            <p class="mb-4 text-justify" contenteditable="${isEditMode}" data-field="paragrafPembuka">${suratData.paragrafPembuka}</p>
            <p class="mb-2" contenteditable="${isEditMode}" data-field="labelDataDiri">${suratData.labelDataDiri}</p>
            <table class="ml-4 mb-4 text-sm w-full">
                ${personalInfoHtml}
            </table>
        </div>

        <div class="text-sm">
            ${bodyHtml}
            <p class="mb-3 text-justify" contenteditable="${isEditMode}" data-field="lampiranHeader">${suratData.lampiranHeader}</p>
            <ol class="list-none pl-0 mb-4 space-y-1">
                ${attachmentsHtml}
            </ol>
            <p class="mb-6 text-justify" contenteditable="${isEditMode}" data-field="paragrafPenutup">${suratData.paragrafPenutup}</p>
        </div>

        <div class="mt-8 flex justify-end">
            <div class="text-center w-64">
                <p class="mb-1" contenteditable="${isEditMode}" data-field="salamPenutup">${suratData.salamPenutup}</p>
                <div class="relative inline-block my-2 cursor-pointer group" onclick="triggerSignUpload()" title="Klik untuk ganti tanda tangan">
                    <img id="signature-preview" src="${suratData.signatureImage}" alt="Tanda Tangan" class="h-20 mx-auto object-contain transition group-hover:opacity-80">
                    ${isEditMode ? '<span class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-xs opacity-0 group-hover:opacity-100 rounded">Ganti Tanda Tangan</span>' : ''}
                </div>
                <input type="file" id="sign-file-input" accept="image/*" class="hidden" onchange="handleSignUpload(event)">
                <p class="font-bold underline mt-1" contenteditable="${isEditMode}" data-field="signatureName">${suratData.signatureName}</p>
            </div>
        </div>
    `;
}

// Trigger Signature Upload from Gallery
function triggerSignUpload() {
    if (!isEditMode) return;
    document.getElementById('sign-file-input').click();
}

// Handle Signature Image Upload
function handleSignUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            suratData.signatureImage = e.target.result;
            const imgPreview = document.getElementById('signature-preview');
            if (imgPreview) imgPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Print PDF
function handleCetakPDF() {
    window.print();
}

// Save JSON
function handleSimpanJSON() {
    if (isEditMode) {
        syncDomToData();
    }

    if (activeTab === 'surat') {
        downloadJSON(suratData, 'surat.json');
    } else {
        downloadJSON(cvData, 'data.json');
    }
}

// Helper to trigger JSON download
function downloadJSON(data, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
