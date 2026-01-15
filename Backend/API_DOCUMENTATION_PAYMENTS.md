# Payment Transactions API Documentation

## Base URL
```
http://localhost:5000/api/payments
```

## Authentication
Barcha endpointlar authentication talab qiladi. Authorization headerda JWT token bo'lishi kerak:
```
Authorization: Bearer <your-token>
```

Token olish uchun avval admin login qilishingiz kerak.

---

## Payment Transaction Model

Payment Transaction quyidagi maydonlarga ega:

- **operatsiyaRaqami** (String, majburiy) - Operatsiya raqami
- **tranzaksiyaId** (String, majburiy) - Tranzaksiya IDsi
- **terminalId** (String, majburiy) - Terminal ID
- **merchantId** (String, majburiy) - Merchant ID
- **vaqt** (Date, majburiy) - To'lov vaqti
- **mijozTelefonRaqami** (String, majburiy) - Mijozning telefon raqami
- **mijozIsmi** (String, majburiy) - Mijozning ismi
- **muddat** (String, majburiy) - Muddat
- **summa** (String, majburiy) - Summa
- **hisobgaOtkazilganSumma** (String, majburiy) - Hisobga o'tkazilgan summa
- **dokonManzili** (String, ixtiyoriy) - Do'kon manzili
- **originalMessage** (String) - Original Telegram xabari
- **telegramMessageId** (Number) - Telegram xabar IDsi
- **telegramChatId** (Number) - Telegram chat IDsi
- **createdAt** (Date, auto) - Yaratilgan sana
- **updatedAt** (Date, auto) - Yangilangan sana

**Eslatma:** 
- Ma'lumotlar Telegram guruhdan avtomatik olinadi va saqlanadi
- Har bir xabar o'z `telegramMessageId` va `telegramChatId` kombinatsiyasi bilan unique saqlanadi
- Duplicate xabarlar avtomatik tushirib yuboriladi
- Bot guruhga qo'shilganda, barcha mavjud xabarlarni avtomatik qayta ishlaydi

---

## API Endpoints

### 1. Barcha To'lov Tranzaksiyalarini Olish

Barcha to'lov tranzaksiyalarini olish. Filtr va pagination imkoniyatlari mavjud.

**Endpoint:** `GET /api/payments`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `operatsiyaRaqami` (optional) - Operatsiya raqami bo'yicha filtr
- `tranzaksiyaId` (optional) - Tranzaksiya ID bo'yicha filtr
- `terminalId` (optional) - Terminal ID bo'yicha filtr
- `merchantId` (optional) - Merchant ID bo'yicha filtr
- `mijozTelefonRaqami` (optional) - Mijoz telefon raqami bo'yicha qidiruv
- `mijozIsmi` (optional) - Mijoz ismi bo'yicha qidiruv
- `startDate` (optional) - Boshlang'ich sana (ISO format)
- `endDate` (optional) - Tugash sanasi (ISO format)
- `page` (optional, default: 1) - Sahifa raqami
- `limit` (optional, default: 50) - Har bir sahifadagi elementlar soni

**Example Requests:**

Barcha tranzaksiyalarni olish:
```bash
GET /api/payments
```

Faqat birinchi sahifani olish (10 ta):
```bash
GET /api/payments?page=1&limit=10
```

Operatsiya raqami bo'yicha qidirish:
```bash
GET /api/payments?operatsiyaRaqami=666247
```

Mijoz ismi bo'yicha qidirish:
```bash
GET /api/payments?mijozIsmi=FERUZA
```

Sana oralig'i bo'yicha filtr:
```bash
GET /api/payments?startDate=2026-01-01&endDate=2026-01-31
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "operatsiyaRaqami": "666247",
      "tranzaksiyaId": "116284",
      "terminalId": "03620Z51",
      "merchantId": "000330567230903",
      "vaqt": "2026-01-14T12:15:00.000Z",
      "mijozTelefonRaqami": "998942330690",
      "mijozIsmi": "FERUZA ADASHEVA",
      "muddat": "12 oy",
      "summa": "4,800,000.00 UZS",
      "hisobgaOtkazilganSumma": "3,888,000.00 UZS",
      "dokonManzili": "Asaka tumani, Margʻiloniy 37 uy",
      "telegramMessageId": 12345,
      "telegramChatId": -1001234567890,
      "yangi": true,
      "createdAt": "2026-01-14T12:16:00.000Z",
      "updatedAt": "2026-01-14T12:16:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `yangi` (Boolean) - `true` agar tranzaksiya so'nggi 24 soat ichida yaratilgan bo'lsa, aks holda `false`

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 2. Bitta To'lov Tranzaksiyasini Olish

ID bo'yicha bitta to'lov tranzaksiyasini olish.

**Endpoint:** `GET /api/payments/:id`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Tranzaksiyaning MongoDB ID si

**Example Request:**
```bash
GET /api/payments/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "operatsiyaRaqami": "666247",
    "tranzaksiyaId": "116284",
    "terminalId": "03620Z51",
    "merchantId": "000330567230903",
    "vaqt": "2026-01-14T12:15:00.000Z",
    "mijozTelefonRaqami": "998942330690",
    "mijozIsmi": "FERUZA ADASHEVA",
    "muddat": "12 oy",
    "summa": "4,800,000.00 UZS",
    "hisobgaOtkazilganSumma": "3,888,000.00 UZS",
    "dokonManzili": "Asaka tumani, Margʻiloniy 37 uy",
    "originalMessage": "To'lov muvaffaqiyatli o'tdi!...",
    "telegramMessageId": 12345,
    "telegramChatId": -1001234567890,
    "createdAt": "2026-01-14T12:16:00.000Z",
    "updatedAt": "2026-01-14T12:16:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "To'lov tranzaksiyasi topilmadi"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Noto'g'ri ID formati"
}
```

---

### 3. To'lov Statistikasi

To'lovlar bo'yicha umumiy statistika olish.

**Endpoint:** `GET /api/payments/stats/summary`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional) - Boshlang'ich sana (ISO format)
- `endDate` (optional) - Tugash sanasi (ISO format)

**Example Request:**
```bash
GET /api/payments/stats/summary
```

Yoki sana oralig'i bilan:
```bash
GET /api/payments/stats/summary?startDate=2026-01-01&endDate=2026-01-31
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 150,
    "totalSumma": "720,000,000.00",
    "totalHisobgaOtkazilgan": "583,200,000.00"
  }
}
```

---

## Error Responses

Barcha xato javoblari quyidagi formatda:

```json
{
  "success": false,
  "message": "Xato xabari"
}
```

### HTTP Status Kodlari:
- `200` - Muvaffaqiyatli
- `400` - Noto'g'ri so'rov (validation xatolari)
- `401` - Autentifikatsiya talab qilinadi
- `404` - Topilmadi
- `500` - Server xatosi

---

## Telegram Bot

Telegram bot avtomatik ravishda guruhdan to'lov xabarlarini o'qib, parse qilib, bazaga saqlaydi.

### Bot Token
Bot token `.env` faylida `TELEGRAM_BOT_TOKEN` o'zgaruvchisida saqlanadi.

### Xabar Format

Bot quyidagi formatdagi xabarlarni avtomatik taniydi va saqlaydi:

```
To'lov muvaffaqiyatli o'tdi!

OOO «TALAB VA TAKLIF AGENYCY»

Do'kon manzili: Asaka tumani, Margʻiloniy 37 uy

Operatsiya raqami: 666247

Tranzaksiya IDsi: 116284

Terminal ID: 03620Z51

Merchant ID: 000330567230903

Vaqt: 🕗 14.01.2026 17:15

Mijozning telefon raqami: 998942330690

Mijozning ismi: FERUZA ADASHEVA

Muddat: 12 oy

Summa: 4,800,000.00 UZS

Hisobingizga o'tkaziladi: 3,888,000.00 UZS
```

### Bot Xususiyatlari

- Faqat guruh va superguruhlardan xabarlarni qabul qiladi
- Xabarlarni avtomatik parse qiladi
- Duplicate xabarlarni `telegramMessageId` va `telegramChatId` kombinatsiyasi bo'yicha tekshiradi
- Bot guruhga qo'shilganda, barcha mavjud xabarlarni avtomatik qayta ishlaydi
- Yangi kelayotgan xabarlarni real-time qayta ishlaydi
- Guruhda hech qanday javob bermaydi (faqat ma'lumotlarni yig'adi)
- Xatolarni console'ga yozadi
- Server ishga tushganda avtomatik ishga tushadi

---

## cURL Misollari

### 1. Barcha Tranzaksiyalarni Olish
```bash
curl -X GET http://localhost:5000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Pagination bilan
```bash
curl -X GET "http://localhost:5000/api/payments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Operatsiya raqami bo'yicha qidirish
```bash
curl -X GET "http://localhost:5000/api/payments?operatsiyaRaqami=666247" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Mijoz ismi bo'yicha qidirish
```bash
curl -X GET "http://localhost:5000/api/payments?mijozIsmi=FERUZA" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Sana oralig'i bilan
```bash
curl -X GET "http://localhost:5000/api/payments?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Bitta Tranzaksiyani Olish
```bash
curl -X GET http://localhost:5000/api/payments/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Statistika Olish
```bash
curl -X GET http://localhost:5000/api/payments/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Misollari

### 1. Barcha Tranzaksiyalarni Olish
- **Method:** GET
- **URL:** `http://localhost:5000/api/payments`
- **Headers:**
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`

### 2. Filtr bilan
- **Method:** GET
- **URL:** `http://localhost:5000/api/payments?operatsiyaRaqami=666247&page=1&limit=10`
- **Headers:**
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`

### 3. Bitta Tranzaksiyani Olish
- **Method:** GET
- **URL:** `http://localhost:5000/api/payments/:id`
- **Headers:**
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`

---

## Workflow Misoli

1. **Admin login qilish:**
```bash
POST /api/admin/login
{
  "email": "general@admin.com",
  "password": "admin123"
}
```
Javob: `{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`

2. **Telegram botni guruhga qo'shish:**
   - Bot guruhga qo'shilganda, barcha mavjud xabarlarni avtomatik qayta ishlaydi
   - Yangi kelayotgan xabarlar real-time qayta ishlanadi

3. **Barcha tranzaksiyalarni olish (yangi flag bilan):**
```bash
GET /api/payments
Authorization: Bearer <token>
```
Javob: Har bir tranzaksiyada `yangi: true/false` maydoni bo'ladi (1 kungacha yangi)

4. **Bitta tranzaksiyani olish:**
```bash
GET /api/payments/:id
Authorization: Bearer <token>
```

5. **Statistika olish:**
```bash
GET /api/payments/stats/summary
Authorization: Bearer <token>
```

## Yangi Flag (yangi)

Har bir tranzaksiyada `yangi` maydoni mavjud:
- `yangi: true` - Tranzaksiya so'nggi 24 soat ichida yaratilgan
- `yangi: false` - Tranzaksiya 24 soatdan oldin yaratilgan

Bu flag avtomatik hisoblanadi va har bir GET so'rovida yangilanadi.
