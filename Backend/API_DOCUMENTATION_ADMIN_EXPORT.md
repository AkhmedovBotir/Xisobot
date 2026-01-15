# Admin Statistika Export API Documentation

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

## Excel Export API

Statistika ma'lumotlarini Excel formatida export qilish. Barcha statistika filtrlari qo'llab-quvvatlanadi.

**Endpoint:** `GET /api/admin/statistika/export`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
Barcha statistika API filtrlari qo'llab-quvvatlanadi:
- `keyin` (optional) - Sana tanlash: `hammasi` yoki `all` (barcha sanalar) yoki muayyan sana (ISO format: `2024-01-15` yoki `2024-01-15T00:00:00.000Z`)
- `startDate` (optional) - Boshlanish sanasi (ISO format: `2024-01-01T00:00:00.000Z`). `keyin` parametri bo'lmaganda ishlatiladi
- `endDate` (optional) - Tugash sanasi (ISO format: `2024-01-31T23:59:59.999Z`). `keyin` parametri bo'lmaganda ishlatiladi
- `telefonRaqami` (optional) - Mijoz telefon raqami bo'yicha qidirish (qismiy mos kelish ham ishlaydi)
- `dillerId` (optional) - Filtr qilish: muayyan diller ID si bo'yicha
- `sotuvchiId` (optional) - Filtr qilish: muayyan sotuvchi ID si bo'yicha

**Example Requests:**

Barcha statistikani export qilish:
```bash
GET /api/admin/statistika/export
Authorization: Bearer <token>
```

Muayyan sana bo'yicha export:
```bash
GET /api/admin/statistika/export?keyin=2024-01-15
Authorization: Bearer <token>
```

Muayyan diller bo'yicha export:
```bash
GET /api/admin/statistika/export?dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

Kombinatsiya:
```bash
GET /api/admin/statistika/export?keyin=2024-01-15&dillerId=507f1f77bcf86cd799439011&telefonRaqami=998942330690
Authorization: Bearer <token>
```

---

## Success Response (200)

**Format:**
```json
{
  "success": true,
  "exportId": "export_1705123456789_abc123def",
  "message": "Excel fayl muvaffaqiyatli yaratildi",
  "filename": "statistika_export_2024-01-15T10-30-45.xlsx",
  "downloadUrl": "/api/admin/statistika/export/download/statistika_export_2024-01-15T10-30-45.xlsx?exportId=export_1705123456789_abc123def",
  "status": "completed"
}
```

---

## Export Status API

Export jarayonini kuzatish uchun.

**Endpoint:** `GET /api/admin/statistika/export/status/:exportId`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `exportId` - Export ID (export endpoint javobidan olinadi)

**Example Request:**
```bash
GET /api/admin/statistika/export/status/export_1705123456789_abc123def
Authorization: Bearer <token>
```

---

## Success Response (200) - Status

**Format:**
```json
{
  "success": true,
  "exportId": "export_1705123456789_abc123def",
  "status": "completed",
  "progress": 100,
  "message": "Excel fayl tayyor",
  "filename": "statistika_export_2024-01-15T10-30-45.xlsx",
  "downloadUrl": "/api/admin/statistika/export/download/statistika_export_2024-01-15T10-30-45.xlsx?exportId=export_1705123456789_abc123def"
}
```

**Status Values:**
- `processing` - Fayl yaratilmoqda
- `completed` - Fayl tayyor
- `error` - Xatolik yuz berdi

**Progress:** 0 dan 100 gacha (foizlarda)

---

## Download Excel File API

Yaratilgan Excel faylni yuklab olish. Fayl yuklab olingandan keyin avtomatik o'chiriladi.

**Endpoint:** `GET /api/admin/statistika/export/download/:filename`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `filename` - Excel fayl nomi (export endpoint javobidan olinadi)

**Query Parameters:**
- `exportId` (optional) - Export ID (tekshirish uchun)

**Example Request:**
```bash
GET /api/admin/statistika/export/download/statistika_export_2024-01-15T10-30-45.xlsx?exportId=export_1705123456789_abc123def
Authorization: Bearer <token>
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="statistika_export_2024-01-15T10-30-45.xlsx"`
- File body (Excel file)

**Eslatma:** Fayl yuklab olingandan keyin avtomatik o'chiriladi. Har bir export so'rov uchun bir marta download qilish mumkin.

---

## Excel File Structure

### Header Section

Excel fayl quyidagi strukturada:

**1. Title Row:**
- "STATISTIKA EKSPORT" (ko'k rangda, bold, 16pt)

**2. Filter Information Row:**
- Qo'llanilgan filtrlarning to'liq tavsifi
- Masalan: "Sana: 2024-01-15, Diller ID: 507f1f77bcf86cd799439011"

**3. Export Date Row:**
- "Export vaqti: 15/01/2024, 10:30"

**4. Total Count Row:**
- "Jami tranzaksiyalar: 150" (bold)

**5. Empty Row**

### Table Section

**Header Row** (ko'k fon, oq matn, bold):
1. **Tartib raqam** - Ketma-ket raqam (1, 2, 3...)
2. **Diller** - Diller ismi va familiyasi (tartib raqami bilan)
3. **Sotuvchi** - Sotuvchi ismi va familiyasi (tartib raqami bilan)
4. **Shartnoma raqami** - Operatsiya raqami
5. **Xaridor ismi** - Xaridor to'liq ismi
6. **Tel nomeri** - Xaridor telefon raqami
7. **OPEN summasi** - Umumiy summa (summa maydoni, formatted: "4,800,000.00 UZS")
8. **Qolgan summa** - Hisobga o'tkazilgan summa (hisobgaOtkazilganSumma maydoni, formatted: "4,800,000.00 UZS")

**Data Rows:**
- Har bir satr bitta tranzaksiya ma'lumotlarini o'z ichiga oladi
- Juft-qatorlar och kulrang fonda
- Toq-qatorlar oq fonda
- Barcha qatorlar ramkalangan

---

## Excel File Features

1. **Professional Design:**
   - Chiroyli header dizayn
   - Rangli jadval header (ko'k fon, oq matn)
   - Alternativ qator ranglari (legibility uchun)
   - Barcha qatorlar ramkalangan

2. **Auto-sizing:**
   - Barcha ustunlar moslashgan kenglikda
   - Matn qatorlarda ko'rsatilishi mumkin (wrapText)

3. **Information Rich:**
   - Filtrlash ma'lumotlari headerda
   - Export vaqti ko'rsatiladi
   - Jami tranzaksiyalar soni ko'rsatiladi

---

## Error Responses

**Error Response (400) - Noto'g'ri ID formati:**
```json
{
  "success": false,
  "message": "Noto'g'ri diller ID formati"
}
```

**Error Response (404) - Export topilmadi:**
```json
{
  "success": false,
  "message": "Export topilmadi"
}
```

**Error Response (404) - Fayl topilmadi:**
```json
{
  "success": false,
  "message": "Fayl topilmadi"
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

### 1. Barcha statistikani export qilish
```bash
GET /api/admin/statistika/export
Authorization: Bearer <token>
```

### 2. Bugungi statistikani export qilish
```bash
GET /api/admin/statistika/export?keyin=2024-01-15
Authorization: Bearer <token>
```

### 3. Muayyan dillerning statistikasini export qilish
```bash
GET /api/admin/statistika/export?dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### 4. Export jarayonini kuzatish
```bash
# Export qilish
GET /api/admin/statistika/export?keyin=2024-01-15
Authorization: Bearer <token>

# Status tekshirish
GET /api/admin/statistika/export/status/export_1705123456789_abc123def
Authorization: Bearer <token>
```

### 5. Excel faylni yuklab olish
```bash
GET /api/admin/statistika/export/download/statistika_export_2024-01-15T10-30-45.xlsx?exportId=export_1705123456789_abc123def
Authorization: Bearer <token>
```

---

## Complete Workflow

### 1. Export qilish
```bash
GET /api/admin/statistika/export?keyin=2024-01-15&dillerId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "exportId": "export_1705123456789_abc123def",
  "message": "Excel fayl muvaffaqiyatli yaratildi",
  "filename": "statistika_export_2024-01-15T10-30-45.xlsx",
  "downloadUrl": "/api/admin/statistika/export/download/statistika_export_2024-01-15T10-30-45.xlsx?exportId=export_1705123456789_abc123def",
  "status": "completed"
}
```

### 2. Status tekshirish (ixtiyoriy)
```bash
GET /api/admin/statistika/export/status/export_1705123456789_abc123def
Authorization: Bearer <token>
```

### 3. Faylni yuklab olish
```bash
GET /api/admin/statistika/export/download/statistika_export_2024-01-15T10-30-45.xlsx?exportId=export_1705123456789_abc123def
Authorization: Bearer <token>
```

**Response:** Excel fayl body (binary)

**Eslatma:** Fayl yuklab olingandan keyin avtomatik o'chiriladi.

---

## Notes

1. **Export Process:**
   - Export jarayoni asinxron ishlaydi
   - Status endpoint orqali progress kuzatilishi mumkin
   - Katta ma'lumotlar uchun vaqt olishi mumkin

2. **File Cleanup:**
   - Fayl yuklab olingandan keyin 1 soniyadan keyin avtomatik o'chiriladi
   - Har bir export so'rov uchun bir marta download qilish mumkin
   - Export ID 1 minutdan keyin status xotirasidan o'chiriladi

3. **Filters:**
   - Barcha statistika API filtrlari qo'llab-quvvatlanadi
   - Filtr ma'lumotlari Excel headerida ko'rsatiladi

4. **File Format:**
   - Format: `.xlsx` (Excel 2007+)
   - Encoding: UTF-8
   - Professional dizayn va formatlanish

5. **Storage:**
   - Fayllar `uploads/` papkasida saqlanadi
   - Papka avtomatik yaratiladi agar mavjud bo'lmasa
   - Fayllar yuklab olingandan keyin o'chiriladi

6. **Security:**
   - Har bir download authentication talab qiladi
   - Export ID tekshiriladi (agar berilgan bo'lsa)
   - Faqat bir marta download qilish mumkin
