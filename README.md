# CV DigitalKu

> Portofolio dan CV digital interaktif untuk menampilkan beberapa versi profil profesional dalam satu halaman.

CV DigitalKu adalah aplikasi web statis yang dibuat untuk menampilkan CV Muhammad Rizky Saputra secara rapi, responsif, dan mudah disesuaikan. Pengguna dapat memilih profil berdasarkan kebutuhan, mengedit isi CV langsung dari halaman, mengunduh data terbaru dalam format JSON, dan mencetak CV sebagai PDF.

## Fitur Utama

- Login sederhana dengan autentikasi berbasis `sessionStorage`.
- Tiga pilihan profil CV:
  - Technology
  - Guru / Teacher
  - Umum / General
- Data CV terpisah dari tampilan dan disimpan di `data.json`.
- Mode edit langsung melalui elemen `contenteditable`.
- Ekspor perubahan ke file `data.json`.
- Cetak atau simpan CV sebagai PDF dengan layout A4.
- Tampilan responsif untuk desktop, tablet, dan perangkat mobile.
- Footer copyright dengan tahun otomatis.
- Ikon antarmuka menggunakan Font Awesome dan styling menggunakan Tailwind CSS CDN.

## Teknologi

- HTML5
- CSS3
- JavaScript Vanilla
- Tailwind CSS CDN
- Font Awesome CDN
- Web Crypto API untuk proses hash password

## Struktur Proyek

```text
CV_DigitalKu-main/
├── asset/
│   └── 46 biru.jpg       # Foto profil
├── data.json              # Data untuk seluruh profil CV
├── index.html             # Struktur halaman dan komponen login
├── script.js              # Login, render CV, edit mode, dan ekspor JSON
├── style.css              # Styling tambahan dan aturan cetak PDF
└── README.md              # Dokumentasi proyek
```

## Cara Menjalankan

Karena aplikasi membaca `data.json` menggunakan `fetch()`, jalankan melalui web server lokal. Membuka `index.html` langsung dengan `file://` dapat menyebabkan data gagal dimuat di beberapa browser.

### Menggunakan Python

Pastikan Python sudah terpasang, lalu jalankan perintah berikut dari folder proyek:

```bash
python -m http.server 8000
```

Buka alamat berikut di browser:

```text
http://localhost:8000
```

## Cara Menggunakan

1. Masuk menggunakan akun yang dikonfigurasi di `script.js`.
2. Pilih profil CV dari tab di header.
3. Klik **Mode Edit** untuk mengubah teks pada CV.
4. Klik **Simpan JSON** untuk mengunduh data CV yang sudah diperbarui.
5. Ganti file `data.json` di proyek dengan file hasil unduhan jika perubahan ingin digunakan kembali.
6. Klik **Cetak PDF** untuk mencetak atau menyimpan CV sebagai PDF.

## Mengubah Isi CV

Semua konten profil dapat diubah dari `data.json`. Setiap profil memiliki struktur data yang sama, seperti:

```json
{
  "name": "Nama Lengkap",
  "title": "Jabatan atau fokus profesional",
  "themeColor": "blue",
  "phone": "08xx-xxxx-xxxx",
  "summary": "Ringkasan profil",
  "skills": [],
  "experience": [],
  "organization": [],
  "education": [],
  "certifications": []
}
```

Pastikan format JSON tetap valid setelah diedit. Perubahan pada struktur key dapat memengaruhi proses render CV di `script.js`.

## Catatan Keamanan

Fitur login ini ditujukan sebagai proteksi akses ringan untuk aplikasi statis. Karena kredensial dan kode JavaScript dikirim ke browser, fitur ini bukan pengganti autentikasi server untuk data yang sangat sensitif.

Untuk penggunaan publik, pertimbangkan autentikasi berbasis server atau layanan identity provider. Jangan menyimpan password asli di repository publik.

## Lisensi dan Kredit

Proyek ini dibuat untuk kebutuhan portofolio dan CV digital pribadi.

Copyright 2026 Muhammad Rizky Saputra.
