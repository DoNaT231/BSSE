import * as usersRepository from "../repositories/usersRepository.js";

/**
 * Saját profil lekérése
 */
export async function getOwnProfile(currentUserId) {
  const user = await usersRepository.findById(currentUserId);

  if (!user) {
    throw new Error("Felhasználó nem található.");
  }

  if (!user.is_active) {
    throw new Error("Ez a felhasználó inaktív.");
  }

  return user;
}

/**
 * Saját profil frissítése
 * Direkt nincs benne userType és isActive
 */
export async function updateOwnProfile(
  currentUserId,
  {
    username,
    email,
    isLocal,
    phone,
  }
) {
  const existingUser = await usersRepository.findById(currentUserId);

  if (!existingUser) {
    throw new Error("Felhasználó nem található.");
  }

  if (!existingUser.is_active) {
    throw new Error("Ez a felhasználó inaktív.");
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    const userWithSameEmail = await usersRepository.findByEmail(normalizedEmail);

    if (userWithSameEmail && userWithSameEmail.id !== currentUserId) {
      throw new Error("Ez az email már használatban van.");
    }

    email = normalizedEmail;
  }

  if (username !== undefined) {
    username = username?.trim() || null;
  }

  return usersRepository.updateProfileById(currentUserId, {
    username,
    email,
    isLocal,
    phone,
  });
}

/**
 * Admin: összes user listázása
 */
export async function getAllUsers(currentUser) {

  return usersRepository.findAll();
}

/**
 * Admin: egy user lekérése
 */
export async function getUserByIdForAdmin(currentUser, targetUserId) {

  const user = await usersRepository.findById(targetUserId);

  if (!user) {
    throw new Error("Felhasználó nem található.");
  }

  return user;
}

/**
 * Admin: user módosítása
 */
export async function adminUpdateUser(
  currentUser,
  targetUserId,
  {
    username,
    email,
    userType,
    isLocal,
    phone,
    isActive,
  }
) {

  const existingUser = await usersRepository.findById(targetUserId);

  if (!existingUser) {
    throw new Error("Felhasználó nem található.");
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    const userWithSameEmail = await usersRepository.findByEmail(normalizedEmail);

    if (userWithSameEmail && userWithSameEmail.id !== Number(targetUserId)) {
      throw new Error("Ez az email már használatban van.");
    }

    email = normalizedEmail;
  }

  if (username !== undefined) {
    username = username?.trim() || null;
  }

  if (userType !== undefined) {
    const allowedUserTypes = ["USER", "ADMIN", "STRAND_WORKER"];

    if (!allowedUserTypes.includes(userType)) {
      throw new Error("Érvénytelen user_type.");
    }
  }

  return usersRepository.updateById(targetUserId, {
    username,
    email,
    userType,
    isLocal,
    phone,
    isActive,
  });
}

/**
 * Admin: user deaktiválása
 * Ezt inkább ajánlom a fizikai törlés helyett
 */
export async function adminDeactivateUser(currentUser, targetUserId) {

  const existingUser = await usersRepository.findById(targetUserId);

  if (!existingUser) {
    throw new Error("Felhasználó nem található.");
  }

  return usersRepository.updateActiveStatusById(targetUserId, false);
}

/**
 * Admin: user újraaktiválása
 */
export async function adminActivateUser(currentUser, targetUserId) {

  const existingUser = await usersRepository.findById(targetUserId);

  if (!existingUser) {
    throw new Error("Felhasználó nem található.");
  }

  return usersRepository.updateActiveStatusById(targetUserId, true);
}

/**
 * Admin: user végleges törlése
 * Csak akkor használd, ha tényleg biztosan ezt akarod
 */
export async function adminDeleteUser(currentUser, targetUserId) {

  const existingUser = await usersRepository.findById(targetUserId);

  if (!existingUser) {
    throw new Error("Felhasználó nem található.");
  }

  return usersRepository.deleteById(targetUserId);
}