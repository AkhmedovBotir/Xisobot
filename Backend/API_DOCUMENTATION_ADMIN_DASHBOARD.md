# Admin Dashboard API Documentation

## Base URL
```
http://localhost:5000/api/admin
```

## Authentication
Barcha endpointlar authentication talab qiladi. Authorization headerda JWT token bo'lishi kerak:
```
Authorization: Bearer <your-token>
```

Token olish uchun avval admin login qilishingiz kerak (qarang: `API_DOCUMENTATION.md`).

---

## Dashboard API

Admin dashboard uchun to'liq statistika va muhim ma'lumotlar.

**Endpoint:** `GET /api/admin/dashboard`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** Yo'q (barcha ma'lumotlar avtomatik hisoblanadi)

**Example Request:**
```bash
GET /api/admin/dashboard
Authorization: Bearer <token>
```

---

## Success Response (200)

**Format:**
```json
{
  "success": true,
  "data": {
    "umumiy": {
      "jamiTranzaksiyalar": 1500,
      "jamiSumma": 24500000000.50,
      "jamiSummaFormatted": "24,500,000,000.50 UZS",
      "jamiHisobgaOtkazilgan": 23000000000.00,
      "jamiHisobgaOtkazilganFormatted": "23,000,000,000.00 UZS",
      "qolganSumma": 1500000000.50,
      "qolganSummaFormatted": "1,500,000,000.50 UZS"
    },
    "bugungi": {
      "jamiTranzaksiyalar": 45,
      "jamiSumma": 1200000000.00,
      "jamiSummaFormatted": "1,200,000,000.00 UZS",
      "jamiHisobgaOtkazilgan": 1100000000.00,
      "jamiHisobgaOtkazilganFormatted": "1,100,000,000.00 UZS",
      "qolganSumma": 100000000.00,
      "qolganSummaFormatted": "100,000,000.00 UZS"
    },
    "kechagi": {
      "jamiTranzaksiyalar": 38,
      "jamiSumma": 980000000.00,
      "jamiSummaFormatted": "980,000,000.00 UZS",
      "jamiHisobgaOtkazilgan": 900000000.00,
      "jamiHisobgaOtkazilganFormatted": "900,000,000.00 UZS",
      "qolganSumma": 80000000.00,
      "qolganSummaFormatted": "80,000,000.00 UZS"
    },
    "haftalik": {
      "jamiTranzaksiyalar": 280,
      "jamiSumma": 8500000000.00,
      "jamiSummaFormatted": "8,500,000,000.00 UZS",
      "jamiHisobgaOtkazilgan": 8000000000.00,
      "jamiHisobgaOtkazilganFormatted": "8,000,000,000.00 UZS",
      "qolganSumma": 500000000.00,
      "qolganSummaFormatted": "500,000,000.00 UZS"
    },
    "oylik": {
      "jamiTranzaksiyalar": 1150,
      "jamiSumma": 32000000000.00,
      "jamiSummaFormatted": "32,000,000,000.00 UZS",
      "jamiHisobgaOtkazilgan": 30000000000.00,
      "jamiHisobgaOtkazilganFormatted": "30,000,000,000.00 UZS",
      "qolganSumma": 2000000000.00,
      "qolganSummaFormatted": "2,000,000,000.00 UZS"
    },
    "muhimKoRsatkichlar": {
      "jamiDillerlar": 25,
      "faolDillerlar": 22,
      "jamiSotuvchilar": 150,
      "faolSotuvchilar": 145,
      "yangiTranzaksiyalar": 5
    },
    "soNggiTranzaksiyalar": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "xaridorIsmi": "FERUZA",
        "xaridorFamiliyasi": "ADASHEVA",
        "telefonRaqami": "998942330690",
        "summa": "4,800,000.00 UZS",
        "summaNumber": 4800000.00,
        "qolganSumma": "0.00",
        "qolganSummaFormatted": "0.00 UZS",
        "shartnomaRaqami": "OP123456789",
        "sotuvchi": {
          "_id": "507f1f77bcf86cd799439012",
          "ism": "Islom",
          "familiya": "Ibrohim",
          "tartibRaqami": "S1",
          "fullName": "Islom Ibrohim"
        },
        "diller": {
          "_id": "507f1f77bcf86cd799439013",
          "ism": "Botir",
          "familiya": "Akhmedov",
          "tartibRaqami": "D1",
          "fullName": "Botir Akhmedov"
        },
        "vaqt": "2024-01-15T17:15:00.000Z",
        "tranzaksiyaId": "116284"
      }
    ]
  }
}
```

---

## Response Field Descriptions

### Top Level:
- `success` (Boolean) - So'rov muvaffaqiyatli bo'lsa `true`
- `data` (Object) - Dashboard ma'lumotlari

### Data Object Fields:

#### 1. `umumiy` (Object) - Umumiy statistika (barcha vaqtlar uchun)
- `jamiTranzaksiyalar` (Number) - Jami tranzaksiyalar soni
- `jamiSumma` (Number) - Jami summa (raqam formatida)
- `jamiSummaFormatted` (String) - Jami summa (formatted)
- `jamiHisobgaOtkazilgan` (Number) - Jami hisobga o'tkazilgan summa (raqam formatida)
- `jamiHisobgaOtkazilganFormatted` (String) - Jami hisobga o'tkazilgan summa (formatted)
- `qolganSumma` (Number) - Qolgan summa (raqam formatida)
- `qolganSummaFormatted` (String) - Qolgan summa (formatted)

#### 2. `bugungi` (Object) - Bugungi statistika (00:00 dan hozirgi vaqtgacha)
- Xuddi `umumiy` bilan bir xil struktura

#### 3. `kechagi` (Object) - Kechagi statistika (kecha 00:00 dan 23:59:59 gacha)
- Xuddi `umumiy` bilan bir xil struktura

#### 4. `haftalik` (Object) - Haftalik statistika (oxirgi 7 kun)
- Xuddi `umumiy` bilan bir xil struktura

#### 5. `oylik` (Object) - Oylik statistika (oxirgi 30 kun)
- Xuddi `umumiy` bilan bir xil struktura

#### 6. `muhimKoRsatkichlar` (Object) - Muhim ko'rsatkichlar
- `jamiDillerlar` (Number) - Jami dillerlar soni
- `faolDillerlar` (Number) - Faol dillerlar soni
- `jamiSotuvchilar` (Number) - Jami sotuvchilar soni
- `faolSotuvchilar` (Number) - Faol sotuvchilar soni
- `yangiTranzaksiyalar` (Number) - Oxirgi 24 soatda qo'shilgan yangi tranzaksiyalar soni

#### 7. `soNggiTranzaksiyalar` (Array) - So'nggi 10 ta tranzaksiya
Har bir tranzaksiya quyidagi maydonlarga ega:
- `_id` (String) - Tranzaksiya ID si
- `xaridorIsmi` (String) - Xaridor ismi
- `xaridorFamiliyasi` (String) - Xaridor familiyasi
- `telefonRaqami` (String) - Xaridor telefon raqami
- `summa` (String) - Summa (formatted)
- `summaNumber` (Number) - Summa (raqam formatida)
- `qolganSumma` (String) - Qolgan summa (raqam formatida)
- `qolganSummaFormatted` (String) - Qolgan summa (formatted)
- `shartnomaRaqami` (String) - Shartnoma raqami (operatsiya raqami)
- `sotuvchi` (Object|null) - Sotuvchi ma'lumotlari
- `diller` (Object|null) - Diller ma'lumotlari
- `vaqt` (Date) - Tranzaksiya vaqti
- `tranzaksiyaId` (String) - Tranzaksiya ID si

---

## Vaqt Oralig'lari

### Bugungi
- **Boshlanish**: Bugun 00:00:00
- **Tugash**: Hozirgi vaqt

### Kechagi
- **Boshlanish**: Kecha 00:00:00
- **Tugash**: Kecha 23:59:59

### Haftalik
- **Boshlanish**: 7 kun oldin 00:00:00
- **Tugash**: Hozirgi vaqt

### Oylik
- **Boshlanish**: 30 kun oldin 00:00:00
- **Tugash**: Hozirgi vaqt

### Yangi Tranzaksiyalar
- **Vaqt oralig'i**: Oxirgi 24 soat (createdAt maydoni bo'yicha)

---

## Formulalar

- **Qolgan summa** = `jamiSumma - jamiHisobgaOtkazilgan`

---

## Eslatmalar

1. **Faqat biriktirilgan tranzaksiyalar**: Barcha statistikalar faqat sotuvchiga biriktirilgan tranzaksiyalar bo'yicha hisoblanadi (`sotuvchiId` mavjud bo'lgan)

2. **Parallel hisoblash**: Barcha davrlar statistikasi parallel (Promise.all) ishlatib hisoblanadi, bu tezlikni oshiradi

3. **So'nggi tranzaksiyalar**: Faqat 10 ta eng so'nggi tranzaksiya qaytariladi (vaqt bo'yicha kamayish tartibida)

4. **Format**: Barcha summalar ikkita formadda qaytariladi:
   - Raqam formatida (hisoblash uchun)
   - Formatted string formatida (ko'rsatish uchun)

5. **Sotuvchi va Diller**: So'nggi tranzaksiyalarda sotuvchi va diller ma'lumotlari populate qilingan

6. **Status**: Faol dillerlar va sotuvchilar `status: 'active'` bo'lganlar

---

## Error Responses

**Error Response (401) - Authentication kerak:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (500) - Server xatosi:**
```json
{
  "success": false,
  "message": "Server xatosi",
  "error": "Error message details"
}
```

---

## Use Cases

### Dashboard ma'lumotlarini olish
```bash
GET /api/admin/dashboard
Authorization: Bearer <token>
```

Bu endpoint bitta so'rovda barcha kerakli dashboard ma'lumotlarini qaytaradi:
- Umumiy statistika
- Bugungi statistika
- Kechagi statistika
- Haftalik statistika
- Oylik statistika
- Muhim ko'rsatkichlar (dillerlar, sotuvchilar, yangi tranzaksiyalar)
- So'nggi 10 ta tranzaksiya

Bu ma'lumotlar dashboard sahifasida ko'rsatish uchun yetarli.
