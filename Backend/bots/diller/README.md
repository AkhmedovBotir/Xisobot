# Diller Telegram Bot

Bu bot Dillerlar uchun yaratilgan Telegram bot bo'lib, Dillerlar ro'yxatdan o'tib, o'z sotuvchilarini boshqarishlari mumkin.

## Xususiyatlar

- ✅ Ro'yxatdan o'tish (Ism, Familiya, Telefon raqam)
- ✅ Telefon raqam tekshiruvi (bazada mavjud bo'lishi kerak)
- ✅ Asosiy menyu (Sotuvchilar, Statistika, Sozlamalar)
- ✅ Sotuvchilar bo'limi:
  - Mening sotuvchilarim (ro'yxat)
  - Sotuvchi qo'shish
- ✅ Chiroyli dizayn va keyboard'lar

## Bot Token

Bot token `.env` faylida `DILLER_BOT_TOKEN` o'zgaruvchisida saqlanadi.

```env
DILLER_BOT_TOKEN=your-bot-token-here
```

## Ro'yxatdan O'tish

1. Botni ishga tushiring: `/start`
2. Ismingizni kiriting
3. Familiyangizni kiriting
4. Telefon raqamingizni yuboring (keyboard button yoki text)
5. Telefon raqam bazada mavjud bo'lsa, ro'yxatdan o'tish yakunlanadi

## Ishlatish

### Asosiy Menyu

- **👥 Sotuvchilar** - Sotuvchilar bo'limi
- **📊 Statistika** - Statistika ko'rish
- **⚙️ Sozlamalar** - Sozlamalar (hozircha mavjud emas)

### Sotuvchilar Bo'limi

- **📋 Mening sotuvchilarim** - O'ziga biriktirilgan sotuvchilar ro'yxati
- **➕ Sotuvchi qo'shish** - Yangi sotuvchi qo'shish

### Sotuvchi Qo'shish

1. "➕ Sotuvchi qo'shish" tugmasini bosing
2. Sotuvchi ismini kiriting
3. Sotuvchi familiyasini kiriting
4. Sotuvchi telefon raqamini yuboring
5. Sotuvchi muvaffaqiyatli qo'shiladi

## Model O'zgarishlari

### Diller Model
- `telegramChatId` - Telegram chat ID
- `telegramUserId` - Telegram user ID

### Sotuvchi Model
- `dillerId` - Diller bilan bog'lanish (reference)

## State Management

Bot in-memory state management ishlatadi:
- `NONE` - Hech qanday state yo'q
- `WAITING_FOR_ISM` - Ism kutilmoqda
- `WAITING_FOR_FAMILIYA` - Familiya kutilmoqda
- `WAITING_FOR_PHONE` - Telefon raqam kutilmoqda
- `REGISTERED` - Ro'yxatdan o'tgan
- `ADDING_SOTUVCHI_*` - Sotuvchi qo'shish jarayoni

## Eslatma

- Bot faqat bazada mavjud bo'lgan telefon raqamlar bilan ishlaydi
- Har bir telefon raqam faqat bitta Telegram akkaunt bilan bog'lanishi mumkin
- Sotuvchilar faqat o'z dilleriga biriktiriladi
