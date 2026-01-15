# Admin Foiz (Percentage) Configuration API

Bu API Admin uchun hisobga o'tkazilgan summaning foizini (percentage) boshqarish uchun yaratilgan. Foiz qiymati Excel eksportda "Umumiy hisobga o'tkazilgan summaning X foizi" hisoblanadi.

---

## Base URL

```
/api/admin/config/foiz
```

---

## Endpoints

### 1. Foizni olish (Get Percentage)

**Endpoint:** `GET /api/admin/config/foiz`

**Access:** Private (Admin authentication required)

**Description:** Joriy foiz konfiguratsiyasini oladi. Agar konfiguratsiya mavjud bo'lmasa, default 5% qiymat bilan yaratiladi.

#### Request

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "foiz": 5,
    "description": "Hisobga o'tkazilgan summaning foizi (5% default)",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Server xatosi",
  "error": "Error message"
}
```

---

### 2. Foizni yangilash (Update Percentage)

**Endpoint:** `PUT /api/admin/config/foiz`

**Access:** Private (Admin authentication required)

**Description:** Foiz qiymatini yangilaydi. Foiz 0 va 100 orasida bo'lishi kerak.

#### Request

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "foiz": 7.5
}
```

**Body Parameters:**
- `foiz` (number, required): Yangi foiz qiymati. 0 va 100 orasida bo'lishi kerak.

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Foiz muvaffaqiyatli yangilandi",
  "data": {
    "foiz": 7.5,
    "description": "Hisobga o'tkazilgan summaning foizi (7.5%)",
    "updatedAt": "2026-01-15T10:35:00.000Z"
  }
}
```

**Error Response (400 Bad Request) - Foiz kiritilmagan:**
```json
{
  "success": false,
  "message": "Foiz qiymati kiritilishi kerak"
}
```

**Error Response (400 Bad Request) - Noto'g'ri foiz qiymati:**
```json
{
  "success": false,
  "message": "Foiz 0 va 100 orasida bo'lishi kerak"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authorized"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Server xatosi",
  "error": "Error message"
}
```

---

## Usage Examples

### Example 1: Joriy foizni olish

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/config/foiz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "foiz": 5,
    "description": "Hisobga o'tkazilgan summaning foizi (5% default)",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

### Example 2: Foizni 7.5% ga yangilash

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/config/foiz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foiz": 7.5
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Foiz muvaffaqiyatli yangilandi",
  "data": {
    "foiz": 7.5,
    "description": "Hisobga o'tkazilgan summaning foizi (7.5%)",
    "updatedAt": "2026-01-15T10:35:00.000Z"
  }
}
```

### Example 3: Foizni 10% ga yangilash

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/config/foiz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foiz": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Foiz muvaffaqiyatli yangilandi",
  "data": {
    "foiz": 10,
    "description": "Hisobga o'tkazilgan summaning foizi (10%)",
    "updatedAt": "2026-01-15T10:40:00.000Z"
  }
}
```

---

## Notes

1. **Default Value:** Agar konfiguratsiya birinchi marta olinayotgan bo'lsa va ma'lumotlar bazasida mavjud bo'lmasa, avtomatik ravishda 5% qiymati bilan yaratiladi.

2. **Foiz Hesaplama:** Excel eksportda "Umumiy hisobga o'tkazilgan summaning X foizi" quyidagicha hisoblanadi:
   ```
   Umumiy hisobga o'tkazilgan summaning X foizi = Umumiy hisobgaOtkazilganSumma * (foiz / 100)
   ```

3. **Validation:** Foiz qiymati 0 va 100 orasida bo'lishi shart. Masalan:
   - ✅ 0, 5, 7.5, 10, 100 - valid
   - ❌ -5, 101, "abc" - invalid

4. **Excel Export Integration:** Foiz konfiguratsiyasi Excel eksport jarayonida avtomatik ravishda olinadi va ishlatiladi. Excel faylida "Umumiy hisobga o'tkazilgan summaning X foizi" qatorida joriy foiz qiymati ko'rsatiladi.

5. **Upsert Behavior:** `PUT` endpointi konfiguratsiyani yangilaydi yoki (agar mavjud bo'lmasa) yaratadi.

---

## Related Endpoints

- [Admin Statistics Export API](./API_DOCUMENTATION_ADMIN_EXPORT.md) - Excel eksport funksiyasi foiz konfiguratsiyasidan foydalanadi
