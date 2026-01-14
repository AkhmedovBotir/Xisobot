# Telegram Bot - Group Scraping

Bu bot Telegram guruhlaridan to'lov tranzaksiyalarini avtomatik o'qib, MongoDB bazasiga saqlaydi.

## Guruh ID ni Olish

### Usul 1: Bot buyrug'i orqali

1. Botni guruhga qo'shing
2. Guruhda `/get_chat_id` buyrug'ini yuboring
3. Bot sizga chat ID ni yuboradi

### Usul 2: Console log orqali

Bot ishga tushganda, har bir xabar kelganda console'da chat ID ko'rinadi:
```
Message from chat: Guruh nomi (ID: -1001234567890)
```

### Usul 3: Boshqa botlar orqali

- [@userinfobot](https://t.me/userinfobot) - Bu botga xabar yuboring, u sizga chat ID ni ko'rsatadi
- [@getidsbot](https://t.me/getidsbot) - Yana bir ID olish boti

## Botni Ma'lum Bir Guruhga Qo'shish

### 1. Botni guruhga qo'shing

1. Telegram'da guruhga kiring
2. Guruh sozlamalariga kiring (Settings)
3. "Add Members" yoki "Qo'shish" ni bosing
4. Bot username ni qidiring va qo'shing

**Muhim:** Bot guruhga qo'shilgandan keyin, faqat shu vaqtdan keyin yuborilgan xabarlarni ko'radi.

### 2. Guruh ID ni olish

Guruhda `/get_chat_id` buyrug'ini yuboring.

### 3. .env faylida sozlash

`.env` faylida `ALLOWED_CHAT_IDS` ni qo'shing:

```env
ALLOWED_CHAT_IDS=-1001234567890,-1001234567891
```

Agar bir nechta guruh bo'lsa, ID larni vergul bilan ajrating.

**Eslatma:** Agar `ALLOWED_CHAT_IDS` bo'sh bo'lsa yoki yo'q bo'lsa, bot barcha guruhlardan xabarlarni qabul qiladi.

## Bot Buyruqlari

- `/start` - Botni ishga tushirish
- `/get_chat_id` - Joriy chat ID ni olish
- `/stats` - Tranzaksiyalar statistikasi
- `/process_old` - Eski xabarlarni qayta ishlash
- `/help` - Yordam

## Ishlatish

### Barcha guruhlardan xabarlarni qabul qilish

`.env` faylida `ALLOWED_CHAT_IDS` ni qoldiring yoki o'chiring:

```env
# ALLOWED_CHAT_IDS bo'sh yoki yo'q
```

### Faqat ma'lum guruhlardan xabarlarni qabul qilish

`.env` faylida:

```env
ALLOWED_CHAT_IDS=-1001234567890
```

Yoki bir nechta guruh:

```env
ALLOWED_CHAT_IDS=-1001234567890,-1001234567891,-1001234567892
```

## Eski Xabarlarni Qayta Ishlash

Telegram Bot API cheklovlari tufayli, bot faqat guruhga qo'shilgandan keyin yuborilgan xabarlarni ko'radi.

Eski xabarlarni qayta ishlash uchun:

1. **Forward qilish:** Eski xabarlarni guruhga forward qiling
2. **Qayta yuborish:** Eski xabarlarni guruhga qayta yuboring
3. **Bot buyrug'i:** `/process_old` buyrug'ini ishlating (cheklangan)

## Debug

Bot console'da quyidagi ma'lumotlarni ko'rsatadi:

- Har bir xabar kelganda chat nomi va ID
- Payment xabar aniqlanganda
- Xabar saqlanganda
- Xatolar

## Muammolar

### Bot xabarlarni ko'rmayapti

1. Bot guruhga qo'shilganligini tekshiring
2. Bot guruhda faol ekanligini tekshiring
3. `ALLOWED_CHAT_IDS` ni tekshiring
4. Console'da xatolarni ko'ring

### Guruh ID topilmayapti

1. `/get_chat_id` buyrug'ini guruhda ishlating
2. Console loglarni tekshiring
3. Boshqa botlar orqali ID ni oling
