import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(40, "Must be under 40 characters")
  .regex(/^[a-zA-ZÀ-ÿ' -]+$/, "Letters, spaces and hyphens only");

/** Luhn checksum used for South African ID numbers. */
export function isValidSaid(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;

  const digits = id.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let d = digits[i];
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  if (check !== digits[12]) return false;

  // Validate the birth date encoded in the first 6 digits.
  const yy = Number(id.slice(0, 2));
  const mm = Number(id.slice(2, 4));
  const dd = Number(id.slice(4, 6));
  const year = 1900 + yy + (yy > 25 ? -100 : 0);
  const date = new Date(year, mm - 1, dd);
  if (date.getFullYear() !== year || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
    return false;
  }
  return true;
}

export const idNumberSchema = (idType: "sa-id" | "passport") =>
  idType === "sa-id"
    ? z
        .string()
        .trim()
        .min(1, "SA ID number is required")
        .refine((v) => /^\d{13}$/.test(v), "Must be a 13-digit South African ID number")
        .refine(isValidSaid, "This ID number failed validation — check the digits")
    : z
        .string()
        .trim()
        .min(1, "Passport number is required")
        .regex(/^[A-Za-z0-9]{6,12}$/, "Passport numbers are 6–12 alphanumeric characters");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Mobile number is required")
  .regex(/^(\+27|0027|0)[0-9]{9}$/, "Use a South African number, e.g. +27 82 123 4567");

export const passwordSchema = z
  .string()
  .min(12, "At least 12 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

export const emergencyContactSchema = z
  .string()
  .trim()
  .min(2, "Enter a contact name")
  .max(60, "Keep it under 60 characters");

export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; checks: string[] } {
  const checks = [
    { label: "12+ characters", ok: pw.length >= 12 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "Lowercase letter", ok: /[a-z]/.test(pw) },
    { label: "Number", ok: /[0-9]/.test(pw) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const score = (passed === 5 ? 4 : passed >= 4 ? 3 : passed >= 3 ? 2 : passed >= 2 ? 1 : 0) as
    0 | 1 | 2 | 3 | 4;
  return { score, checks: checks.map((c) => c.label) };
}

export const amountSchema = (max = 100000) =>
  z.coerce.number().min(50, "Minimum top-up is R 50").max(max, "Amount exceeds the daily limit");
