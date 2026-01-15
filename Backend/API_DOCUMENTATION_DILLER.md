# Dillerlar API Documentation

## Base URL
```
http://localhost:5000/api/diller
```

## Authentication
Barcha endpointlar authentication talab qiladi. Authorization headerda JWT token bo'lishi kerak:
```
Authorization: Bearer <your-token>
```

Token olish uchun avval admin login qilishingiz kerak (qarang: `API_DOCUMENTATION.md`).

---

## Diller Model

Diller quyidagi maydonlarga ega:

- **ism** (String, majburiy) - Dillerning ismi
- **familiya** (String, majburiy) - Dillerning familiyasi
- **telefonRaqam** (String, majburiy, unique) - Telefon raqami
- **status** (String, enum: 'active' | 'inactive', default: 'active') - Diller holati
- **tartibRaqami** (Number, unique, auto-increment) - Avtomatik ketma-ket raqam
- **createdAt** (Date, auto) - Yaratilgan sana
- **updatedAt** (Date, auto) - Yangilangan sana

**Eslatma:** `tartibRaqami` avtomatik beriladi. Yangi diller qo'shilganda, eng katta tartib raqamidan keyingi raqam avtomatik beriladi.

---

## API Endpoints

### 1. Barcha Dillerlarni Olish

Barcha dillerlarni olish. Filtr va qidiruv imkoniyatlari mavjud.

**Endpoint:** `GET /api/diller`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional) - Filtr qilish: `active` yoki `inactive`
- `search` (optional) - Qidiruv: ism, familiya yoki telefon raqam bo'yicha

**Example Requests:**

Barcha dillerlarni olish:
```bash
GET /api/diller
```

Faol dillerlarni olish:
```bash
GET /api/diller?status=active
```

Qidiruv:
```bash
GET /api/diller?search=Akmal
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
      "tartibRaqami": 3,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "ism": "Dilshod",
      "familiya": "Rahimov",
      "telefonRaqam": "+998901234568",
      "status": "active",
      "tartibRaqami": 4,
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

### 2. Bitta Dillerni Olish

ID bo'yicha bitta dillerni olish.

**Endpoint:** `GET /api/diller/:id`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Dillerning MongoDB ID si

**Example Request:**
```bash
GET /api/diller/507f1f77bcf86cd799439011
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
    "tartibRaqami": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Diller topilmadi"
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

### 3. Yangi Diller Yaratish

Yangi diller yaratish. Tartib raqami avtomatik beriladi.

**Endpoint:** `POST /api/diller`

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
POST /api/diller
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
  "message": "Diller muvaffaqiyatli yaratildi",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "ism": "Akmal",
    "familiya": "Karimov",
    "telefonRaqam": "+998901234567",
    "status": "active",
    "tartibRaqami": 3,
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

### 4. Dillerni Yangilash

Mavjud dillerni yangilash.

**Endpoint:** `PUT /api/diller/:id`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` - Dillerning MongoDB ID si

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
PUT /api/diller/507f1f77bcf86cd799439011
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
  "message": "Diller muvaffaqiyatli yangilandi",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "ism": "Akmal",
    "familiya": "Karimov",
    "telefonRaqam": "+998901234567",
    "status": "inactive",
    "tartibRaqami": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Diller topilmadi"
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

### 5. Dillerni O'chirish

Dillerni o'chirish.

**Endpoint:** `DELETE /api/diller/:id`

**Access:** Private (Authentication kerak)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Dillerning MongoDB ID si

**Example Request:**
```bash
DELETE /api/diller/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Diller muvaffaqiyatli o'chirildi",
  "data": {}
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Diller topilmadi"
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

1. Birinchi diller qo'shilganda: `tartibRaqami = 1`
2. Ikkinchi diller qo'shilganda: `tartibRaqami = 2`
3. Uchinchi diller qo'shilganda: `tartibRaqami = 3`
4. Va hokazo...

**Muhim:** 
- Tartib raqami faqat yangi diller yaratilganda avtomatik beriladi
- Yangilash (PUT) operatsiyasida tartib raqami o'zgarmaydi
- Agar diller o'chirilsa, tartib raqamlari qolgan dillerlar uchun o'zgarmaydi

**Misol:**
- Akmal Karimov qo'shildi → `tartibRaqami = 3` (agar avval 2 ta diller bo'lsa)
- Keyingi diller qo'shilsa → `tartibRaqami = 4`
- Undan keyingisi → `tartibRaqami = 5`

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

### 1. Barcha Dillerlarni Olish
```bash
curl -X GET http://localhost:5000/api/diller \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Faol Dillerlarni Olish
```bash
curl -X GET "http://localhost:5000/api/diller?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Qidiruv
```bash
curl -X GET "http://localhost:5000/api/diller?search=Akmal" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Bitta Dillerni Olish
```bash
curl -X GET http://localhost:5000/api/diller/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Yangi Diller Yaratish
```bash
curl -X POST http://localhost:5000/api/diller \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "ism": "Akmal",
    "familiya": "Karimov",
    "telefonRaqam": "+998901234567",
    "status": "active"
  }'
```

### 6. Dillerni Yangilash
```bash
curl -X PUT http://localhost:5000/api/diller/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

### 7. Dillerni O'chirish
```bash
curl -X DELETE http://localhost:5000/api/diller/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Misollari

### 1. Yangi Diller Yaratish
- **Method:** POST
- **URL:** `http://localhost:5000/api/diller`
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

### 2. Barcha Dillerlarni Olish
- **Method:** GET
- **URL:** `http://localhost:5000/api/diller`
- **Headers:**
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`

### 3. Dillerni Yangilash
- **Method:** PUT
- **URL:** `http://localhost:5000/api/diller/:id`
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

2. **Yangi diller yaratish:**
```bash
POST /api/diller
Authorization: Bearer <token>
{
  "ism": "Akmal",
  "familiya": "Karimov",
  "telefonRaqam": "+998901234567"
}
```
Javob: `{ "tartibRaqami": 3 }` (agar avval 2 ta diller bo'lsa)

3. **Barcha dillerlarni olish:**
```bash
GET /api/diller
Authorization: Bearer <token>
```

4. **Dillerni yangilash:**
```bash
PUT /api/diller/:id
Authorization: Bearer <token>
{
  "status": "inactive"
}
```

5. **Dillerni o'chirish:**
```bash
DELETE /api/diller/:id
Authorization: Bearer <token>
```
