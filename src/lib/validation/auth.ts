import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email manzilini to'g'ri kiriting"),
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
