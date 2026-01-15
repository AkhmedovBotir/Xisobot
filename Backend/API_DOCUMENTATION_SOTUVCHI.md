# Sotuvchilar API Documentation

## Base URL
```
http://localhost:5000/api/sotuvchi
```

## Authentication
Barcha endpointlar authentication talab qiladi. Authorization headerda JWT token bo'lishi kerak:
```
Authorization: Bearer <your-token>
```

Token olish uchun avval admin login qilishingiz kerak (qarang: `API_DOCUMENTATION.md`).

---

## Sotuvchi Model

Sotuvchi quyidagi maydonlarga ega:

- **ism** (String, majburiy) - Sotuvchining ismi
- **familiya** (String, majburiy) - Sotuvchining familiyasi
- **telefonRaqam** (String, majburiy, unique) - Telefon raqami
- **status** (String, enum: 'active' | 'inactive', default: 'active') - Sotuvchi holati
- **tartibRaqami** (String, unique, auto-increment) - Avtomatik ketma-ket raqam (S1, S2, S3...)
- **createdAt** (Date, auto) - Yaratilgan sana
- **updatedAt** (Date, auto) - Yangilangan sana

**Eslatma:** `tartibRaqami` avtomatik beriladi. Yangi sotuvchi qo'shilganda, eng katta tartib raqamidan keyingi raqam avtomatik beriladi (S1, S2, S3...).

---

## API Endpoints

### 1. Barcha Sotuvchilarni Olish

Barcha sotuvchilarni olish. Filtr va qidiruv imkoniyatlari mavjud.

**Endpoint:** `GET /api/sotuvchi`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional) - Filtr qilish: `active` yoki `inactive`
- `search` (optional) - Qidiruv: ism, familiya yoki telefon raqam bo'yicha

**Example Requests:**

Barcha sotuvchilarni olish:
```bash
GET /api/sotuvchi
```

Faol sotuvchilarni olish:
```bash
GET /api/sotuvchi?status=active
```

Qidiruv:
```bash
GET /api/sotuvchi?search=Akmal
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "ism": "Akmal",
      "familiya": "Karimov",
      "telefonRaqam": "+998901234567",
      "status": "active",
      "tartibRaqami": "S1",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "ism": "Dilshod",
      "familiya": "Rahimov",
      "telefonRaqam": "+998901234568",
      "status": "active",
      "tartibRaqami": "S2",
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 2. Bitta Sotuvchini Olish

ID bo'yicha bitta sotuvchini olish.

**Endpoint:** `GET /api/sotuvchi/:id`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Sotuvchining MongoDB ID si

**Example Request:**
```bash
GET /api/sotuvchi/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "ism": "Akmal",
    "familiya": "Karimov",
    "telefonRaqam": "+998901234567",
    "status": "active",
    "tartibRaqami": "S1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Sotuvchi topilmadi"
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

### 3. Yangi Sotuvchi Yaratish

Yangi sotuvchi yaratish. Tartib raqami avtomatik beriladi (S1, S2, S3...).

**Endpoint:** `POST /api/sotuvchi`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "ism": "Akmal",
  "familiya": "Karimov",
  "telefonRaqam": "+998901234567",
  "status": "active"
}
```

**Field Requirements:**
- `ism` - majburiy
- `familiya` - majburiy
- `telefonRaqam` - majburiy, unique
- `status` - ixtiyoriy (default: "active")

**Example Request:**
```bash
POST /api/sotuvchi
Content-Type: application/json
Authorization: Bearer <token>

{
  "ism": "Akmal",
  "familiya": "Karimov",
  "telefonRaqam": "+998901234567",
  "status": "active"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Sotuvchi muvaffaqiyatli yaratildi",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "ism": "Akmal",
    "familiya": "Karimov",
    "telefonRaqam": "+998901234567",
    "status": "active",
    "tartibRaqami": "S1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Ism, familiya va telefon raqam majburiy"
}
```

**Error Response (400) - Duplicate telefon raqam:**
```json
{
  "success": false,
  "message": "Bu telefon raqam allaqachon mavjud"
}
```

---

### 4. Sotuvchini Yangilash

Mavjud sotuvchini yangilash.

**Endpoint:** `PUT /api/sotuvchi/:id`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` - Sotuvchining MongoDB ID si

**Request Body:**
```json
{
  "ism": "Akmal",
  "familiya": "Karimov",
  "telefonRaqam": "+998901234567",
  "status": "inactive"
}
```

**Field Requirements:**
- Barcha maydonlar ixtiyoriy
- Faqat yuborilgan maydonlar yangilanadi

**Example Request:**
```bash
PUT /api/sotuvchi/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "inactive"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sotuvchi muvaffaqiyatli yangilandi",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "ism": "Akmal",
    "familiya": "Karimov",
    "telefonRaqam": "+998901234567",
    "status": "inactive",
    "tartibRaqami": "S1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Sotuvchi topilmadi"
}
```

**Error Response (400) - Duplicate telefon raqam:**
```json
{
  "success": false,
  "message": "Bu telefon raqam allaqachon mavjud"
}
```

---

### 5. Sotuvchini O'chirish

Sotuvchini o'chirish.

**Endpoint:** `DELETE /api/sotuvchi/:id`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Sotuvchining MongoDB ID si

**Example Request:**
```bash
DELETE /api/sotuvchi/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sotuvchi muvaffaqiyatli o'chirildi",
  "data": {}
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Sotuvchi topilmadi"
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

## Tartib Raqami (tartibRaqami)

Tartib raqami avtomatik ketma-ket beriladi:

1. Birinchi sotuvchi qo'shilganda: `tartibRaqami = "S1"`
2. Ikkinchi sotuvchi qo'shilganda: `tartibRaqami = "S2"`
3. Uchinchi sotuvchi qo'shilganda: `tartibRaqami = "S3"`
4. Va hokazo...

**Muhim:** 
- Tartib raqami faqat yangi sotuvchi yaratilganda avtomatik beriladi
- Yangilash (PUT) operatsiyasida tartib raqami o'zgarmaydi
- Agar sotuvchi o'chirilsa, tartib raqamlari qolgan sotuvchilar uchun o'zgarmaydi

**Misol:**
- Akmal Karimov qo'shildi → `tartibRaqami = "S1"` (agar avval hech qanday sotuvchi bo'lmasa)
- Keyingi sotuvchi qo'shilsa → `tartibRaqami = "S2"`
- Undan keyingisi → `tartibRaqami = "S3"`

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
- `200` - Muvaffaqiyatli (GET, PUT, DELETE)
- `201` - Yaratildi (POST)
- `400` - Noto'g'ri so'rov (validation xatolari)
- `401` - Autentifikatsiya talab qilinadi
- `404` - Topilmadi
- `500` - Server xatosi

---

## cURL Misollari

### 1. Barcha Sotuvchilarni Olish
```bash
curl -X GET http://localhost:5000/api/sotuvchi \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Faol Sotuvchilarni Olish
```bash
curl -X GET "http://localhost:5000/api/sotuvchi?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Qidiruv
```bash
curl -X GET "http://localhost:5000/api/sotuvchi?search=Akmal" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Bitta Sotuvchini Olish
```bash
curl -X GET http://localhost:5000/api/sotuvchi/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Yangi Sotuvchi Yaratish
```bash
curl -X POST http://localhost:5000/api/sotuvchi \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "ism": "Akmal",
    "familiya": "Karimov",
    "telefonRaqam": "+998901234567",
    "status": "active"
  }'
```

### 6. Sotuvchini Yangilash
```bash
curl -X PUT http://localhost:5000/api/sotuvchi/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

### 7. Sotuvchini O'chirish
```bash
curl -X DELETE http://localhost:5000/api/sotuvchi/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Misollari

### 1. Yangi Sotuvchi Yaratish
- **Method:** POST
- **URL:** `http://localhost:5000/api/sotuvchi`
- **Headers:**
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
```json
{
  "ism": "Akmal",
  "familiya": "Karimov",
  "telefonRaqam": "+998901234567",
  "status": "active"
}
```

### 2. Barcha Sotuvchilarni Olish
- **Method:** GET
- **URL:** `http://localhost:5000/api/sotuvchi`
- **Headers:**
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`

### 3. Sotuvchini Yangilash
- **Method:** PUT
- **URL:** `http://localhost:5000/api/sotuvchi/:id`
- **Headers:**
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
```json
{
  "status": "inactive"
}
```

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

2. **Yangi sotuvchi yaratish:**
```bash
POST /api/sotuvchi
Authorization: Bearer <token>
{
  "ism": "Akmal",
  "familiya": "Karimov",
  "telefonRaqam": "+998901234567"
}
```
Javob: `{ "tartibRaqami": "S1" }` (agar avval hech qanday sotuvchi bo'lmasa)

3. **Barcha sotuvchilarni olish:**
```bash
GET /api/sotuvchi
Authorization: Bearer <token>
```

4. **Sotuvchini yangilash:**
```bash
PUT /api/sotuvchi/:id
Authorization: Bearer <token>
{
  "status": "inactive"
}
```

5. **Sotuvchini o'chirish:**
```bash
DELETE /api/sotuvchi/:id
Authorization: Bearer <token>
```
