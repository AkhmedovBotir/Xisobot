# Admin Statistika API Documentation

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

## Statistika API

Admin uchun to'liq statistika ma'lumotlari - har bir tranzaksiya uchun barcha kerakli ma'lumotlar bilan.

**Endpoint:** `GET /api/admin/statistika`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `keyin` (optional) - Sana tanlash: `hammasi` yoki `all` (barcha sanalar) yoki muayyan sana (ISO format: `2024-01-15` yoki `2024-01-15T00:00:00.000Z`). Agar berilgan bo'lsa, tranzaksiyadagi `vaqt` maydoni bo'yicha filtrlanadi
- `startDate` (optional) - Boshlanish sanasi (ISO format: `2024-01-01T00:00:00.000Z`). `keyin` parametri bo'lmaganda ishlatiladi
- `endDate` (optional) - Tugash sanasi (ISO format: `2024-01-31T23:59:59.999Z`). `keyin` parametri bo'lmaganda ishlatiladi
- `telefonRaqami` (optional) - Mijoz telefon raqami bo'yicha qidirish (qismiy mos kelish ham ishlaydi)
- `dillerId` (optional) - Filtr qilish: muayyan diller ID si bo'yicha
- `sotuvchiId` (optional) - Filtr qilish: muayyan sotuvchi ID si bo'yicha
- `page` (optional, default: 1) - Sahifa raqami
- `limit` (optional, default: 50) - Har bir sahifadagi yozuvlar soni

**Example Requests:**

Barcha statistikani olish:
```bash
GET /api/admin/statistika
Authorization: Bearer <token>
```

Barcha sanalar (keyin parametri bilan):
```bash
GET /api/admin/statistika?keyin=hammasi
Authorization: Bearer <token>
```
yoki
```bash
GET /api/admin/statistika?keyin=all
Authorization: Bearer <token>
```

Muayyan sana bo'yicha (keyin parametri bilan):
```bash
GET /api/admin/statistika?keyin=2024-01-15
Authorization: Bearer <token>
```
yoki
```bash
GET /api/admin/statistika?keyin=2024-01-15T00:00:00.000Z
Authorization: Bearer <token>
```

Sana oralig'i bo'yicha (keyin bo'lmaganda):
```bash
GET /api/admin/statistika?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z
Authorization: Bearer <token>
```

Mijoz telefon raqami bo'yicha:
```bash
GET /api/admin/statistika?telefonRaqami=998942330690
Authorization: Bearer <token>
```
yoki qismiy qidiruv:
```bash
GET /api/admin/statistika?telefonRaqami=942330690
Authorization: Bearer <token>
```

Muayyan diller bo'yicha:
```bash
GET /api/admin/statistika?dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

Muayyan sotuvchi bo'yicha:
```bash
GET /api/admin/statistika?sotuvchiId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

Sahifalash bilan:
```bash
GET /api/admin/statistika?page=1&limit=100
Authorization: Bearer <token>
```

Kombinatsiya - muayyan sana va diller:
```bash
GET /api/admin/statistika?keyin=2024-01-15&dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

Kombinatsiya - telefon raqami va sotuvchi:
```bash
GET /api/admin/statistika?telefonRaqami=998942330690&sotuvchiId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

Kombinatsiya - sana oralig'i, diller va telefon:
```bash
GET /api/admin/statistika?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&dillerId=507f1f77bcf86cd799439011&telefonRaqami=998942330690&page=1&limit=50
Authorization: Bearer <token>
```

---

## Success Response (200)

**Format:**
```json
{
  "success": true,
  "count": 50,
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3,
  "data": [
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
      "vaqt": "2024-01-14T17:15:00.000Z",
      "tranzaksiyaId": "116284"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "xaridorIsmi": "MAMURA",
      "xaridorFamiliyasi": "HAKIMOVA",
      "telefonRaqami": "998930481418",
      "summa": "4,500,000.00 UZS",
      "summaNumber": 4500000.00,
      "qolganSumma": "500000.00",
      "qolganSummaFormatted": "500,000.00 UZS",
      "shartnomaRaqami": "OP123456790",
      "sotuvchi": {
        "_id": "507f1f77bcf86cd799439015",
        "ism": "Islom",
        "familiya": "Ibrohim",
        "tartibRaqami": "S1",
        "fullName": "Islom Ibrohim"
      },
      "diller": {
        "_id": "507f1f77bcf86cd799439016",
        "ism": "Jamol",
        "familiya": "Karimov",
        "tartibRaqami": "D2",
        "fullName": "Jamol Karimov"
      },
      "vaqt": "2024-01-14T15:26:00.000Z",
      "tranzaksiyaId": "116230"
    }
  ]
}
```

---

## Response Field Descriptions

### Top Level Fields:
- `success` (Boolean) - So'rov muvaffaqiyatli bo'lsa `true`
- `count` (Number) - Joriy sahifadagi yozuvlar soni
- `total` (Number) - Umumiy yozuvlar soni (filtlar bilan)
- `page` (Number) - Joriy sahifa raqami
- `limit` (Number) - Har bir sahifadagi yozuvlar soni
- `totalPages` (Number) - Umumiy sahifalar soni
- `data` (Array) - Tranzaksiyalar ro'yxati

### Data Object Fields:
Har bir tranzaksiya obyekti quyidagi maydonlarga ega:

- `_id` (String) - Tranzaksiyaning MongoDB ID si
- `xaridorIsmi` (String) - Xaridorning ismi (mijozIsmi dan ajratilgan birinchi qism)
- `xaridorFamiliyasi` (String) - Xaridorning familiyasi (mijozIsmi dan ajratilgan qolgan qism)
- `telefonRaqami` (String) - Xaridor telefon raqami
- `summa` (String) - Umumiy summa (formatted: "4,800,000.00 UZS")
- `summaNumber` (Number) - Umumiy summa (raqam formatida: 4800000.00)
- `qolganSumma` (String) - Qolgan summa (raqam formatida: "0.00")
- `qolganSummaFormatted` (String) - Qolgan summa (formatted: "0.00 UZS")
- `shartnomaRaqami` (String) - Operatsiya raqami (shartnoma raqami)
- `sotuvchi` (Object|null) - Sotuvchi ma'lumotlari
  - `_id` (String) - Sotuvchi ID si
  - `ism` (String) - Sotuvchi ismi
  - `familiya` (String) - Sotuvchi familiyasi
  - `tartibRaqami` (String) - Sotuvchi tartib raqami (masalan: "S1")
  - `fullName` (String) - To'liq ism (ism + familiya)
- `diller` (Object|null) - Diller ma'lumotlari (agar mavjud bo'lsa)
  - `_id` (String) - Diller ID si
  - `ism` (String) - Diller ismi
  - `familiya` (String) - Diller familiyasi
  - `tartibRaqami` (String) - Diller tartib raqami (masalan: "D1")
  - `fullName` (String) - To'liq ism (ism + familiya)
- `vaqt` (Date) - Tranzaksiya vaqti (ISO format)
- `tranzaksiyaId` (String) - Tranzaksiya ID si

**Eslatma:**
- `qolganSumma` = `summa` - `hisobgaOtkazilganSumma`
- Agar sotuvchi bir nechta dillerga biriktirilgan bo'lsa, faqat birinchi diller ko'rsatiladi
- Faqat sotuvchiga biriktirilgan tranzaksiyalar ko'rsatiladi (sotuvchiId mavjud bo'lgan)

---

## Error Responses

**Error Response (401) - Authentication kerak:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Error Response (400) - Noto'g'ri ID formati:**
```json
{
  "success": false,
  "message": "Noto'g'ri ID formati"
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

### 1. Barcha tranzaksiyalarni olish
```bash
GET /api/admin/statistika
Authorization: Bearer <token>
```
yoki
```bash
GET /api/admin/statistika?keyin=hammasi
Authorization: Bearer <token>
```

### 2. Bugungi tranzaksiyalar (keyin parametri bilan)
```bash
GET /api/admin/statistika?keyin=2024-01-15
Authorization: Bearer <token>
```

### 3. Bugungi tranzaksiyalar (startDate/endDate bilan)
```bash
GET /api/admin/statistika?startDate=2024-01-15T00:00:00.000Z&endDate=2024-01-15T23:59:59.999Z
Authorization: Bearer <token>
```

### 4. Muayyan mijozning tranzaksiyalari (telefon raqami bo'yicha)
```bash
GET /api/admin/statistika?telefonRaqami=998942330690
Authorization: Bearer <token>
```

### 5. Muayyan dillerning barcha tranzaksiyalari
```bash
GET /api/admin/statistika?dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### 6. Muayyan sotuvchining tranzaksiyalari
```bash
GET /api/admin/statistika?sotuvchiId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

### 7. Oylik statistika (yanvar oyi) - keyin parametri bilan
```bash
GET /api/admin/statistika?keyin=2024-01-15&page=1&limit=100
Authorization: Bearer <token>
```

### 8. Oylik statistika (yanvar oyi) - startDate/endDate bilan
```bash
GET /api/admin/statistika?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&page=1&limit=100
Authorization: Bearer <token>
```

### 9. Muayyan dillerning muayyan sanadagi tranzaksiyalari
```bash
GET /api/admin/statistika?keyin=2024-01-15&dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### 10. Muayyan mijozning muayyan sanadagi tranzaksiyalari
```bash
GET /api/admin/statistika?keyin=2024-01-15&telefonRaqami=998942330690
Authorization: Bearer <token>
```

### 11. Muayyan dillerning muayyan mijozning tranzaksiyalari
```bash
GET /api/admin/statistika?dillerId=507f1f77bcf86cd799439011&telefonRaqami=998942330690
Authorization: Bearer <token>
```

### 12. To'liq kombinatsiya - sana, diller, telefon, sotuvchi
```bash
GET /api/admin/statistika?keyin=2024-01-15&dillerId=507f1f77bcf86cd799439011&telefonRaqami=998942330690&sotuvchiId=507f1f77bcf86cd799439012&page=1&limit=50
Authorization: Bearer <token>
```

---

## Notes

1. **Sahifalash**: `page` va `limit` parametrlari bilan sahifalash mumkin. Default: `page=1`, `limit=50`

2. **Filtrlash**: Barcha filtr parametrlari (`keyin`, `dillerId`, `sotuvchiId`, `telefonRaqami`, `startDate`, `endDate`) birga ishlatilishi mumkin

3. **Sana filtrlash**:
   - `keyin` parametri ustuvorlikka ega - agar `keyin` berilgan bo'lsa, `startDate` va `endDate` e'tiborga olinmaydi
   - `keyin=hammasi` yoki `keyin=all` - barcha sanalar
   - `keyin=2024-01-15` - faqat 2024-01-15 sanasidagi tranzaksiyalar (00:00:00 dan 23:59:59 gacha)
   - Sana formati: `YYYY-MM-DD` yoki `YYYY-MM-DDTHH:mm:ss.sssZ`

4. **Telefon raqami qidiruv**: `telefonRaqami` parametri qismiy mos kelishni qo'llab-quvvatlaydi. Masalan: `942330690` qidirilganda, `998942330690` ham topiladi

5. **Tartib**: Tranzaksiyalar vaqt bo'yicha kamayish tartibida saralanadi (eng yangilari birinchi)

6. **Populate**: Sotuvchi va Diller ma'lumotlari avtomatik populate qilinadi

7. **Qolgan summa**: `qolganSumma = summa - hisobgaOtkazilganSumma` formulasi bilan hisoblanadi

8. **Sana filtrlash mexanizmi**: Agar `keyin` parametri berilgan bo'lsa va u `hammasi` yoki `all` emas, u holda tranzaksiyadagi `vaqt` maydoni bo'yicha filtrlash amalga oshiriladi. Tanlangan sana 00:00:00 dan 23:59:59 gacha bo'lgan oraliqni qamrab oladi

---

## Statistika Raqamlar API

Admin uchun faqat raqamli statistika ma'lumotlari - jami summalar, qolgan summa va o'rtacha summalar.

**Endpoint:** `GET /api/admin/statistika/raqamlar`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `keyin` (optional) - Sana tanlash: `hammasi` yoki `all` (barcha sanalar) yoki muayyan sana (ISO format: `2024-01-15` yoki `2024-01-15T00:00:00.000Z`)
- `startDate` (optional) - Boshlanish sanasi (ISO format: `2024-01-01T00:00:00.000Z`). `keyin` parametri bo'lmaganda ishlatiladi
- `endDate` (optional) - Tugash sanasi (ISO format: `2024-01-31T23:59:59.999Z`). `keyin` parametri bo'lmaganda ishlatiladi
- `telefonRaqami` (optional) - Mijoz telefon raqami bo'yicha qidirish (qismiy mos kelish ham ishlaydi)
- `dillerId` (optional) - Filtr qilish: muayyan diller ID si bo'yicha
- `sotuvchiId` (optional) - Filtr qilish: muayyan sotuvchi ID si bo'yicha

**Example Requests:**

Barcha raqamli statistikani olish:
```bash
GET /api/admin/statistika/raqamlar
Authorization: Bearer <token>
```

Muayyan sana bo'yicha:
```bash
GET /api/admin/statistika/raqamlar?keyin=2024-01-15
Authorization: Bearer <token>
```

Muayyan diller bo'yicha:
```bash
GET /api/admin/statistika/raqamlar?dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

Muayyan sotuvchi bo'yicha:
```bash
GET /api/admin/statistika/raqamlar?sotuvchiId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

Kombinatsiya:
```bash
GET /api/admin/statistika/raqamlar?keyin=2024-01-15&dillerId=507f1f77bcf86cd799439011&telefonRaqami=998942330690
Authorization: Bearer <token>
```

---

## Success Response (200) - Raqamlar

**Format:**
```json
{
  "success": true,
  "data": {
    "jamiTranzaksiyalar": 150,
    "jamiSumma": 2450000000.50,
    "jamiSummaFormatted": "2,450,000,000.50 UZS",
    "jamiHisobgaOtkazilgan": 2300000000.00,
    "jamiHisobgaOtkazilganFormatted": "2,300,000,000.00 UZS",
    "qolganSumma": 150000000.50,
    "qolganSummaFormatted": "150,000,000.50 UZS",
    "ortachaSumma": 16333333.34,
    "ortachaSummaFormatted": "16,333,333.34 UZS"
  }
}
```

**Bo'sh natija (filtrlar bo'yicha hech narsa topilmasa):**
```json
{
  "success": true,
  "data": {
    "jamiTranzaksiyalar": 0,
    "jamiSumma": 0,
    "jamiSummaFormatted": "0.00 UZS",
    "jamiHisobgaOtkazilgan": 0,
    "jamiHisobgaOtkazilganFormatted": "0.00 UZS",
    "qolganSumma": 0,
    "qolganSummaFormatted": "0.00 UZS",
    "ortachaSumma": 0,
    "ortachaSummaFormatted": "0.00 UZS"
  },
  "message": "Bu diller uchun sotuvchilar topilmadi"
}
```

---

## Response Field Descriptions - Raqamlar

### Data Object Fields:
- `jamiTranzaksiyalar` (Number) - Jami tranzaksiyalar soni
- `jamiSumma` (Number) - Jami summa (raqam formatida)
- `jamiSummaFormatted` (String) - Jami summa (formatted: "2,450,000,000.50 UZS")
- `jamiHisobgaOtkazilgan` (Number) - Jami hisobga o'tkazilgan summa (raqam formatida)
- `jamiHisobgaOtkazilganFormatted` (String) - Jami hisobga o'tkazilgan summa (formatted: "2,300,000,000.00 UZS")
- `qolganSumma` (Number) - Qolgan summa (raqam formatida)
- `qolganSummaFormatted` (String) - Qolgan summa (formatted: "150,000,000.50 UZS")
- `ortachaSumma` (Number) - O'rtacha summa (raqam formatida)
- `ortachaSummaFormatted` (String) - O'rtacha summa (formatted: "16,333,333.34 UZS")

**Formulalar:**
- `qolganSumma = jamiSumma - jamiHisobgaOtkazilgan`
- `ortachaSumma = jamiSumma / jamiTranzaksiyalar` (agar jamiTranzaksiyalar > 0)

---

## Use Cases - Raqamlar

### 1. Barcha raqamli statistika
```bash
GET /api/admin/statistika/raqamlar
Authorization: Bearer <token>
```

### 2. Bugungi raqamli statistika
```bash
GET /api/admin/statistika/raqamlar?keyin=2024-01-15
Authorization: Bearer <token>
```

### 3. Muayyan dillerning raqamli statistikasi
```bash
GET /api/admin/statistika/raqamlar?dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### 4. Muayyan sotuvchining raqamli statistikasi
```bash
GET /api/admin/statistika/raqamlar?sotuvchiId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

### 5. Oylik raqamli statistika
```bash
GET /api/admin/statistika/raqamlar?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z
Authorization: Bearer <token>
```

### 6. Kombinatsiya - sana + diller
```bash
GET /api/admin/statistika/raqamlar?keyin=2024-01-15&dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### 7. Kombinatsiya - telefon + sotuvchi
```bash
GET /api/admin/statistika/raqamlar?telefonRaqami=998942330690&sotuvchiId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

---

## Notes - Raqamlar API

1. **Filtrlar**: Barcha filtr parametrlari (`keyin`, `dillerId`, `sotuvchiId`, `telefonRaqami`, `startDate`, `endDate`) birga ishlatilishi mumkin va ular bir xil logikaga ega (yuqoridagi asosiy Statistika API bilan bir xil)

2. **Formulalar**: 
   - Qolgan summa = Jami summa - Jami hisobga o'tkazilgan
   - O'rtacha summa = Jami summa / Jami tranzaksiyalar soni

3. **Sahifalash yo'q**: Bu API faqat umumiy raqamli statistikani qaytaradi, sahifalash parametrlari (`page`, `limit`) qo'llab-quvvatlanmaydi

4. **Format**: Barcha summalar ikkita formadda qaytariladi - raqam formatida (`jamiSumma`) va formatlangan string formatida (`jamiSummaFormatted`)
