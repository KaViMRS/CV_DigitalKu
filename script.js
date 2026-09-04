let cvData = {};
let currentProfile = 'teleperformance';
let isEditMode = false;

// Variabel global tambahan untuk surat
let suratData = {};
let activeTab = 'cv'; // 'cv' atau 'surat'

// ================= =========================================
// KONTROL LOGIN & KEAMANAN (HASH)
// ==========================================================
// Kredensial Default:
// Username : admin
// Password : wifirumah
const CONFIG_USER = "admin";
// Hash SHA-256 dari password "wifi":
const CONFIG_PASS_HASH = "26d7283780f81206a9fdde9301a90b4d54c8a6174d0308784a7563a1897cf432";

/**
 * Fungsi pembantu enkripsi menggunakan Web Crypto API bawaan browser
 */
async function sha256(plainText) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Cek status autentikasi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        showApp();
    } else {
        showLogin();
    }
});

function showLogin() {
    document.getElementById('login-screen')?.classList.remove('hidden');
    document.getElementById('main-header')?.classList.add('hidden');
    document.getElementById('main-content')?.classList.add('hidden');
    document.getElementById('main-footer')?.classList.add('hidden');
    document.getElementById('edit-banner')?.classList.add('hidden');
}

function showApp() {
    document.getElementById('login-screen')?.classList.add('hidden');
    document.getElementById('main-header')?.classList.remove('hidden');
    document.getElementById('main-content')?.classList.remove('hidden');
    document.getElementById('main-footer')?.classList.remove('hidden');
    
    // Memuat data.json jika data belum ada
    if (Object.keys(cvData).length === 0) {
        fetch('data.json')
            .then(response => {
                if (!response.ok) throw new Error("Gagal memuat data.json");
                return response.json();
            })
            .then(data => {
                cvData = data;
                renderCV(currentProfile);
            })
            .catch(err => {
                console.error("Error loading JSON:", err);
                document.getElementById('cv-card-container').innerHTML = `<p class="text-red-600 font-bold text-center">Gagal memuat file data.json. Pastikan file data.json berada di folder yang sama dengan index.html.</p>`;
            });
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    // Hash input password yang dimasukkan user
    const hashedInput = await sha256(passInput);

    if (userInput === CONFIG_USER && hashedInput === CONFIG_PASS_HASH) {
        sessionStorage.setItem('isLoggedIn', 'true');
        errorEl.classList.add('hidden');
        showApp();
    } else {
        errorEl.classList.remove('hidden');
    }
}

function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    location.reload();
}

// ==========================================================
// FITUR BAWAAN CV (TETAP SAMA SEPERTI SEBELUMNYA)
// ==========================================================

/**
 * Mengganti Profil CV yang Tampil
 */
function switchTab(profile) {
    if (isEditMode) saveCurrentEditsToMemory();
    currentProfile = profile;
    
    const btnTele = document.getElementById('btn-teleperformance');
    const btnGuru = document.getElementById('btn-guru');
    const btnUmum = document.getElementById('btn-umum');

    btnTele.className = profile === 'teleperformance' ? "tab-btn active-tele" : "tab-btn inactive";
    btnGuru.className = profile === 'guru' ? "tab-btn active-guru" : "tab-btn inactive";
    btnUmum.className = profile === 'umum' ? "tab-btn active-umum" : "tab-btn inactive";

    renderCV(currentProfile);
}

/**
 * Render Tampilan CV Berdasarkan Data JSON
 */
function renderCV(profileKey) {
    const data = cvData[profileKey];
    if (!data) return;

    const container = document.getElementById('cv-card-container');
    const colorClass = data.themeColor === 'blue' ? 'text-blue-900 border-blue-900' : 
                      data.themeColor === 'emerald' ? 'text-emerald-900 border-emerald-900' : 'text-indigo-900 border-indigo-900';
    const subColorClass = data.themeColor === 'blue' ? 'text-blue-600' : 
                         data.themeColor === 'emerald' ? 'text-emerald-600' : 'text-indigo-600';

    // Skills HTML
    let skillsHTML = data.skills.map((s, idx) => `
        <div class="skill-box ${idx === data.skills.length - 1 && data.skills.length % 2 !== 0 ? 'sm:col-span-2' : ''}">
            <span class="font-bold ${subColorClass} block mb-1" data-bind="skills.${idx}.category">• ${s.category}</span>
            <p class="text-slate-600" data-bind="skills.${idx}.detail">${s.detail}</p>
        </div>
    `).join('');

    // Experience HTML
    let expHTML = data.experience.map((e, eIdx) => `
        <div class="page-break-inside-avoid">
            <div class="flex justify-between font-bold text-slate-800">
                <span data-bind="experience.${eIdx}.company">${e.company}</span>
                <span class="text-slate-500 font-normal" data-bind="experience.${eIdx}.period">${e.period}</span>
            </div>
            <div class="italic text-slate-600 text-xs mb-1" data-bind="experience.${eIdx}.role">${e.role}</div>
            <ul class="list-disc list-inside text-slate-700 space-y-1">
                ${e.tasks.map((t, tIdx) => `<li data-bind="experience.${eIdx}.tasks.${tIdx}">${t}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    // Organization HTML
    let orgHTML = data.organization.map((o, oIdx) => `
        <div class="page-break-inside-avoid">
            <div class="flex justify-between font-bold text-slate-800">
                <span data-bind="organization.${oIdx}.name">${o.name}</span>
                <span class="text-slate-500 font-normal" data-bind="organization.${oIdx}.period">${o.period}</span>
            </div>
            <div class="italic text-slate-600 text-xs mb-1" data-bind="organization.${oIdx}.role">${o.role}</div>
            <ul class="list-disc list-inside text-slate-700 space-y-1">
                ${o.tasks.map((t, tIdx) => `<li data-bind="organization.${oIdx}.tasks.${tIdx}">${t}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    // Education HTML
    let eduHTML = data.education.map((ed, edIdx) => `
        <div>
            <p class="font-bold text-slate-800" data-bind="education.${edIdx}.school">${ed.school}</p>
            <p class="text-slate-600 text-xs" data-bind="education.${edIdx}.detail">${ed.detail}</p>
        </div>
    `).join('');

    // Certifications HTML
    let certHTML = data.certifications.map((c, cIdx) => `
        <li data-bind="certifications.${cIdx}">${c}</li>
    `).join('');

    container.innerHTML = `
        <div class="border-b-2 ${colorClass.split(' ')[1]} pb-4 flex flex-row justify-between items-start gap-4 page-break-inside-avoid">
            <div>
                <h1 class="text-2xl sm:text-3xl font-bold ${colorClass.split(' ')[0]} uppercase tracking-wide" data-bind="name">${data.name}</h1>
                <p class="${subColorClass} font-semibold text-sm sm:text-base mt-1 uppercase" data-bind="title">${data.title}</p>
                <div class="text-xs sm:text-sm text-slate-600 mt-2 space-y-1">
                    <p><i class="fa-solid fa-location-dot w-5 text-slate-400"></i> <span data-bind="location">${data.location}</span></p>
                    <p><i class="fa-solid fa-envelope w-5 text-slate-400"></i> <span data-bind="email">${data.email}</span></p>
                    <p>
                        <i class="fa-solid fa-phone w-5 text-slate-400"></i> <span data-bind="phone">${data.phone}</span> &nbsp;|&nbsp;
                        <i class="fa-solid fa-globe w-5 text-slate-400"></i> <a href="${data.portfolioUrl}" target="_blank" class="text-blue-600 hover:underline"><span data-bind="portfolio">${data.portfolio}</span></a>
                    </p>
                </div>
            </div>
            <img src="${data.photo}" alt="Pasfoto 3x4" class="photo-placeholder">
        </div>

        <section class="page-break-inside-avoid">
            <h2 class="section-title ${colorClass.split(' ')[0]}"><i class="fa-solid fa-user-tie mr-2"></i>Ringkasan Profil Executive</h2>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify" data-bind="summary">${data.summary}</p>
        </section>

        <section class="page-break-inside-avoid">
            <h2 class="section-title ${colorClass.split(' ')[0]}"><i class="fa-solid fa-gears mr-2"></i>Keahlian Utama & Kompetensi</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">${skillsHTML}</div>
        </section>

        <section>
            <h2 class="section-title ${colorClass.split(' ')[0]}"><i class="fa-solid fa-briefcase mr-2"></i>Pengalaman Kerja</h2>
            <div class="space-y-3 text-xs sm:text-sm">${expHTML}</div>
        </section>

        <section>
            <h2 class="section-title ${colorClass.split(' ')[0]}"><i class="fa-solid fa-users mr-2"></i>Pengalaman Organisasi</h2>
            <div class="space-y-3 text-xs sm:text-sm">${orgHTML}</div>
        </section>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 page-break-inside-avoid">
            <section>
                <h2 class="section-title ${colorClass.split(' ')[0]}"><i class="fa-solid fa-graduation-cap mr-2"></i>Pendidikan Formal</h2>
                <div class="text-xs sm:text-sm space-y-2">${eduHTML}</div>
            </section>
            <section>
                <h2 class="section-title ${colorClass.split(' ')[0]}"><i class="fa-solid fa-certificate mr-2"></i>Sertifikasi Resmi</h2>
                <ul class="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1">${certHTML}</ul>
            </section>
        </div>
    `;

    if (isEditMode) applyEditableState(true);
}

/**
 * Toggle Mode Edit
 */
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btnEdit = document.getElementById('btn-edit');
    const btnDownload = document.getElementById('btn-download');
    const banner = document.getElementById('edit-banner');

    if (isEditMode) {
        btnEdit.className = "bg-amber-500 text-slate-900 font-bold text-xs px-3 py-2 rounded flex items-center transition";
        btnEdit.innerHTML = `<i class="fa-solid fa-pen-to-square mr-1.5"></i> Mode Edit: ON`;
        btnDownload.classList.remove('hidden');
        banner.classList.remove('hidden');
        applyEditableState(true);
    } else {
        saveCurrentEditsToMemory();
        btnEdit.className = "bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-2 rounded font-medium flex items-center transition";
        btnEdit.innerHTML = `<i class="fa-solid fa-pen-to-square mr-1.5"></i> Mode Edit: OFF`;
        btnDownload.classList.add('hidden');
        banner.classList.add('hidden');
        applyEditableState(false);
    }
}

function applyEditableState(enable) {
    const container = document.getElementById('cv-card-container');
    if (enable) container.classList.add('editing-active');
    else container.classList.remove('editing-active');

    const elements = container.querySelectorAll('[data-bind]');
    elements.forEach(el => {
        el.contentEditable = enable ? "true" : "false";
    });
}

/**
 * Menyimpan Edits dari DOM ke Memori `cvData`
 */
function saveCurrentEditsToMemory() {
    const container = document.getElementById('cv-card-container');
    const elements = container.querySelectorAll('[data-bind]');
    
    elements.forEach(el => {
        const path = el.getAttribute('data-bind').split('.');
        let target = cvData[currentProfile];
        
        for (let i = 0; i < path.length - 1; i++) {
            target = target[path[i]];
        }
        
        let text = el.innerText.trim();
        if (path[path.length - 1] === 'category' && text.startsWith('• ')) {
            text = text.replace('• ', '');
        }
        target[path[path.length - 1]] = text;
    });
}

/**
 * Download data.json Terbaru
 */
function downloadJSON() {
    saveCurrentEditsToMemory();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Modifikasi fungsi init atau pemanggilan data awal
async function loadAllData() {
    try {
        // Ambil data CV yang sudah ada
        const resCv = await fetch('data.json');
        cvData = await resCv.json();

        // Ambil data Surat Lamaran
        const resSurat = await fetch('surat.json');
        suratData = await resSurat.json();

        renderProfileTabs();
        renderCV();
        renderSurat();
    } catch (err) {
        console.error("Gagal memuat data:", err);
    }
}

// Fungsi Navigasi Tab
function switchTab(tab) {
    activeTab = tab;
    const cvSection = document.getElementById('cv-container') || document.querySelector('.max-w-4xl'); // sesuaikan ID container CV Anda
    const suratSection = document.getElementById('section-surat');
    const btnCv = document.getElementById('btn-tab-cv');
    const btnSurat = document.getElementById('btn-tab-surat');

    // Sembunyikan/tampilkan profil switcher khusus jika di tab surat
    const profileHeader = document.querySelector('.profile-tabs-container'); // jika ada

    if (tab === 'cv') {
        document.getElementById('section-cv').classList.remove('hidden');
        suratSection.classList.add('hidden');
        btnCv.className = "px-5 py-2 rounded-lg font-medium bg-blue-600 text-white shadow transition";
        btnSurat.className = "px-5 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition";
    } else {
        document.getElementById('section-cv').classList.add('hidden');
        suratSection.classList.remove('hidden');
        btnSurat.className = "px-5 py-2 rounded-lg font-medium bg-blue-600 text-white shadow transition";
        btnCv.className = "px-5 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition";
    }
}

// Render Surat Lamaran
function renderSurat() {
    const container = document.getElementById('section-surat');
    if (!suratData) return;

    let attachmentsHtml = suratData.attachments.map((item, idx) => `<li>${idx + 1}. ${item}</li>`).join('');
    let personalInfoHtml = suratData.personalInfo.map(info => `
        <tr>
            <td class="py-1 pr-4 font-medium">${info.label}</td>
            <td class="py-1 pr-2">:</td>
            <td class="py-1" contenteditable="${isEditMode}">${info.value}</td>
        </tr>
    `).join('');

    let bodyHtml = suratData.bodyParagraphs.map(p => `<p class="mb-4 text-justify" contenteditable="${isEditMode}">${p}</p>`).join('');

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
            <table class="ml-4 mb-4 text-sm">
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
                <div class="relative inline-block my-2 cursor-pointer group" onclick="triggerSignUpload()">
                    <img id="signature-preview" src="${suratData.signatureImage}" alt="Tanda Tangan" class="h-20 mx-auto object-contain transition group-hover:opacity-80" title="Klik untuk ganti tanda tangan">
                    ${isEditMode ? '<span class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-xs opacity-0 group-hover:opacity-100 rounded">Ganti Tanda Tangan</span>' : ''}
                </div>
                <input type="file" id="sign-file-input" accept="image/*" class="hidden" onchange="handleSignUpload(event)">
                <p class="font-bold underline mt-1" contenteditable="${isEditMode}" data-field="signatureName">${suratData.signatureName}</p>
            </div>
        </div>
    `;
}

// Fungsi untuk memicu upload tanda tangan dari galeri
function triggerSignUpload() {
    if (!isEditMode) return;
    document.getElementById('sign-file-input').click();
}

// Handle file gambar tanda tangan yang dipilih
function handleSignUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            suratData.signatureImage = e.target.result;
            document.getElementById('signature-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Tombol Cetak PDF
function handleCetakPDF() {
    window.print();
}

// Tombol Simpan JSON (Bisa mengunduh data sesuai tab aktif atau digabung)
function handleSimpanJSON() {
    if (activeTab === 'surat') {
        // Ambil pembaruan dari DOM jika mode edit aktif
        // ... (sinkronisasi data surat)
        downloadJSON(suratData, 'surat.json');
    } else {
        downloadJSON(cvData, 'data.json');
    }
}

function downloadJSON(data, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
