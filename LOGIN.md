# Cara Login Dashboard Admin

## Membuat Akun Admin Pertama Kali

Untuk login ke dashboard admin, Anda perlu membuat akun admin terlebih dahulu.

### Metode 1: Menggunakan Script (Paling Mudah)

Jalankan perintah berikut di terminal:

```bash
npm run create-admin <username> <password> <nama>
```

**Contoh:**
```bash
npm run create-admin admin admin123 "Administrator"
```

Output:
```
✅ Admin berhasil dibuat!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Username: admin
📝 Nama: Administrator
🔑 Password: admin123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Silakan login di: http://localhost:3000/admin/login
```

### Metode 2: Menggunakan MySQL Console / phpMyAdmin

1. Buka MySQL Console atau phpMyAdmin di Laragon
2. Pilih database `buku_tamu_db`
3. Jalankan SQL berikut (ganti username, password, dan nama sesuai keinginan):

```sql
-- Hash password menggunakan bcrypt (ini contoh untuk password: admin123)
-- Hash: $2a$10$YourHashedPasswordHere
INSERT INTO admin (username, password, name, createdAt) 
VALUES (
  'admin',
  '$2a$10$K7L/WZQhHIpzCqg2zCdqK.YpEz8YNQGw4R6X1Mjm.cRH7OOp4qp5C',
  'Administrator',
  NOW()
);
```

**Note:** Password di atas adalah `admin123` (sudah di-hash dengan bcrypt)

## Login ke Dashboard

1. Jalankan aplikasi: `npm run dev`
2. Buka browser: **http://localhost:3000/admin/login**
3. Masukkan username dan password yang sudah dibuat
4. Klik **Login**

## Default Credentials (jika menggunakan SQL di atas)

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **PENTING:** Segera ganti password setelah login pertama kali!

## Troubleshooting

### Error: "Invalid credentials"
- Pastikan username dan password yang dimasukkan benar
- Username case-sensitive
- Pastikan akun admin sudah dibuat di database

### Error: "npm run create-admin not found"
- Pastikan Anda berada di direktori project yang benar
- Jalankan `npm install` terlebih dahulu

### Lupa Password
Jalankan script create-admin dengan username yang sama untuk mengupdate password:
```bash
npm run create-admin admin password_baru "Administrator"
```
Atau hapus admin lama dan buat baru melalui SQL:
```sql
DELETE FROM admin WHERE username = 'admin';
-- Kemudian jalankan INSERT seperti di atas
```
