import { z } from "zod";

/**
 * KIRISH — LOGIN YOKI EMAIL.
 *
 * Yangi hisoblar login bilan ochiladi va ularda email umuman
 * yo'q; eski hisoblar esa email bilan kiradi. Shuning uchun
 * maydon bitta va u ikkalasini ham qabul qiladi — qaysi biri
 * ekanini server hal qiladi (loginda "@" bo'lishi mumkin emas,
 * ya'ni chalkashish yo'q).
 *
 * Bu yerda email shakli TEKSHIRILMAYDI: "asadbekazamov" ni
 * "email noto'g'ri" deb rad etish aynan yangi foydalanuvchini
 * to'sib qo'yardi.
 */
export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Login yoki emailni kiriting"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(3, "To'liq ism-familiyangizni kiriting").max(160),
    email: z.string().trim().email("Email manzilini to'g'ri kiriting"),
    password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;
