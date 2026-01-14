// Telefon raqamni formatlash funksiyasi
export const formatPhoneNumber = (value) => {
  // Faqat raqamlarni qoldirish
  const numbers = value.replace(/\D/g, '');
  
  // Agar +998 bilan boshlanmasa, qo'shish
  if (numbers.length > 0 && !value.startsWith('+')) {
    if (numbers.startsWith('998')) {
      return '+' + numbers;
    } else if (numbers.startsWith('9')) {
      return '+998' + numbers;
    } else {
      return '+998' + numbers;
    }
  }
  
  return value;
};

// Telefon raqamni validatsiya qilish
export const validatePhoneNumber = (phone) => {
  // Format: +998901234567
  const phoneRegex = /^\+998\d{9}$/;
  return phoneRegex.test(phone);
};

// Telefon raqamni kiritishda avtomatik formatlash
export const handlePhoneInput = (e, setValue) => {
  let value = e.target.value;
  
  // Agar bo'sh bo'lsa, +998 qo'yish
  if (value === '') {
    setValue('+998');
    return;
  }
  
  // Faqat raqamlar va + belgisini qoldirish
  value = value.replace(/[^\d+]/g, '');
  
  // Agar +998 bilan boshlanmasa, +998 qo'shish
  if (!value.startsWith('+998')) {
    if (value.startsWith('998')) {
      value = '+' + value;
    } else if (value.startsWith('+')) {
      // Agar + bilan boshlansa lekin 998 emas
      const numbers = value.substring(1).replace(/\D/g, '');
      if (numbers.startsWith('998')) {
        value = '+' + numbers;
      } else {
        value = '+998' + numbers;
      }
    } else {
      // Faqat raqamlar bo'lsa
      value = '+998' + value;
    }
  }
  
  // Maksimal uzunlik: +998901234567 (13 belgi)
  if (value.length <= 13) {
    setValue(value);
  } else {
    setValue(value.substring(0, 13));
  }
};
