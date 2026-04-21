// +------------------------------------------------------------------+
// |                          authService.js                          |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * authService.js - Uzleti logika szerviz reteg
 * =====================================================================
 *
 * Funkcio:
 * - Domain szabalyok vegrehajtasa es repository hivasok koordinalasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import bcrypt from "bcrypt";
import * as usersRepository from "../repositories/usersRepository.js";

const SALT_ROUNDS = 10;

/**
 * 1. lépés:
 * email megadása után eldönti, mi legyen a következő UI lépés
 *
 * lehetséges válaszok:
 * - REGISTER: nincs ilyen user
 * - LOGIN_WITH_PASSWORD: van user és van jelszó
 * - LOGIN_WITHOUT_PASSWORD: van user és nincs jelszó
 */

export async function startAuthFlow(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email megadása kötelező.");
  }

  const user = await usersRepository.findByEmail(normalizedEmail);

    console.log(user)
    
  if (!user) {
    return {
      action: "REGISTER",
      email: normalizedEmail,
    };
  }

  if (!user.is_active) {
    throw new Error("Ez a felhasználó inaktív.");
  }

  if (!user.passwordHashed) {
    console.log("login without password")
    return {
      action: "LOGIN_WITHOUT_PASSWORD",
      user,
    };
  }

  return {
    action: "ASK_PASSWORD",
    email: normalizedEmail,
  };
}

/**
 * 2. lépés:
 * ha nincs ilyen user, létrehozzuk név + email alapján
 */
export async function registerUser({
  email,
  username,
  isLocal = false,
  phone = null,
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedUsername = username?.trim();

  if (!normalizedEmail) {
    throw new Error("Email megadása kötelező.");
  }

  if (!trimmedUsername) {
    throw new Error("Név megadása kötelező.");
  }

  const existingUser = await usersRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("Ez az email már használatban van.");
  }

  const newUser = await usersRepository.create({
    username: trimmedUsername,
    email: normalizedEmail,
    passwordHashed: null,
    userType: "USER",
    isLocal,
    phone,
    isActive: true,
  });

  return newUser;
}

/**
 * Belépés, ha nincs jelszó a userhez
 */
export async function loginWithoutPassword(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await usersRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Nincs ilyen felhasználó.");
  }

  if (!user.is_active) {
    throw new Error("Ez a felhasználó inaktív.");
  }

  if (user.passwordHashed) {
    throw new Error("Ehhez a fiókhoz jelszó szükséges.");
  }

  return user;
}

/**
 * Belépés jelszóval
 */
export async function loginWithPassword(email, plainPassword) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await usersRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Hibás email vagy jelszó.");
  }

  if (!user.is_active) {
    throw new Error("Ez a felhasználó inaktív.");
  }

  if (!user.passwordHashed) {
    throw new Error("Ehhez a fiókhoz nincs jelszó beállítva.");
  }

  const isMatch = await bcrypt.compare(plainPassword, user.passwordHashed);

  if (!isMatch) {
    throw new Error("Hibás email vagy jelszó.");
  }

  return user;
}

/**
 * Jelszó beállítása első alkalommal vagy később
 */
export async function setPassword(userId, plainPassword) {
  if (!plainPassword || plainPassword.trim().length < 6) {
    throw new Error("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
  }

  const user = await usersRepository.findById(userId);

  if (!user) {
    throw new Error("Felhasználó nem található.");
  }

  if (!user.is_active) {
    throw new Error("Ez a felhasználó inaktív.");
  }

  const passwordHashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  return usersRepository.setPasswordById(userId, passwordHashed);
}

/**
 * Jelszócsere meglévő jelszóval
 */
export async function changePassword({
  userId,
  currentPassword,
  newPassword,
}) {
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error("Az új jelszónak legalább 6 karakter hosszúnak kell lennie.");
  }

  const user = await usersRepository.findById(userId);

  if (!user) {
    throw new Error("Felhasználó nem található.");
  }

  if (!user.passwordHashed) {
    throw new Error("Ehhez a fiókhoz nincs korábbi jelszó beállítva.");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHashed);

  if (!isMatch) {
    throw new Error("A jelenlegi jelszó hibás.");
  }

  const newPasswordHashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  return usersRepository.setPasswordById(userId, newPasswordHashed);
}