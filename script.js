/**
 * Fungsi untuk beralih antara profil Teleperformance dan Guru SMK
 * @param {string} profile - 'teleperformance' atau 'guru'
 */
function switchTab(profile) {
    const teleView = document.getElementById('cv-teleperformance');
    const guruView = document.getElementById('cv-guru');
    const btnTele = document.getElementById('btn-teleperformance');
    const btnGuru = document.getElementById('btn-guru');

    if (profile === 'teleperformance') {
        // Tampilkan Teleperformance, sembunyikan Guru
        teleView.classList.remove('hidden');
        guruView.classList.add('hidden');
        
        // Atur style tombol aktif
        btnTele.className = "tab-btn active-tele";
        btnGuru.className = "tab-btn inactive";
    } else {
        // Tampilkan Guru, sembunyikan Teleperformance
        teleView.classList.add('hidden');
        guruView.classList.remove('hidden');

        // Atur style tombol aktif
        btnGuru.className = "tab-btn active-guru";
        btnTele.className = "tab-btn inactive";
    }
}