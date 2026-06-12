import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const BOLD = { bold: true };

const COL = {
  SORSZAM: 1,
  TEAM: 3,
  PLAYER1: 5,
  PLAYER2: 6,
  PLAYER3: 7,
  EMAIL: 9,
};

function isRegistrationCancelled(registration) {
  return Boolean(
    registration?.isCancelled ??
      registration?.cancelledAt ??
      registration?.cancelled_at
  );
}

function normalizeRegistration(registration) {
  return {
    teamName: registration?.teamName ?? registration?.team_name ?? "",
    contactEmail:
      registration?.contactEmail ??
      registration?.contact_email ??
      registration?.userEmail ??
      registration?.user_email ??
      "",
    players: Array.isArray(registration?.players) ? registration.players : [],
  };
}

function setCell(row, column, value, font) {
  const cell = row.getCell(column);
  cell.value = value ?? "";
  if (font) {
    cell.font = font;
  }
}

function configureSheetLayout(sheet) {
  sheet.getColumn(1).width = 8;
  sheet.getColumn(2).width = 2;
  sheet.getColumn(3).width = 28;
  sheet.getColumn(4).width = 2;
  sheet.getColumn(5).width = 22;
  sheet.getColumn(6).width = 22;
  sheet.getColumn(7).width = 22;
  sheet.getColumn(8).width = 2;
  sheet.getColumn(9).width = 32;
}

function appendHeaderRow(sheet, rowNumber) {
  const headerRow = sheet.getRow(rowNumber);
  setCell(headerRow, COL.SORSZAM, "Sorszám", BOLD);
  setCell(headerRow, COL.TEAM, "Csapatnév", BOLD);
  setCell(headerRow, COL.PLAYER1, "1. játékos", BOLD);
  setCell(headerRow, COL.PLAYER2, "2. játékos", BOLD);
  setCell(headerRow, COL.PLAYER3, "3. játékos", BOLD);
  setCell(headerRow, COL.EMAIL, "Email cím", BOLD);
  return rowNumber + 1;
}

function appendCategorySection(sheet, rowNumber, categoryTitle, registrations) {
  const activeRegistrations = registrations.filter(
    (registration) => !isRegistrationCancelled(registration)
  );

  if (activeRegistrations.length === 0) {
    return rowNumber;
  }

  const categoryRow = sheet.getRow(rowNumber);
  setCell(categoryRow, COL.SORSZAM, String(categoryTitle || "").toUpperCase(), BOLD);
  rowNumber += 1;

  activeRegistrations.forEach((registration, index) => {
    const normalized = normalizeRegistration(registration);
    const dataRow = sheet.getRow(rowNumber);
    setCell(dataRow, COL.SORSZAM, index + 1);
    setCell(dataRow, COL.TEAM, normalized.teamName, BOLD);
    setCell(dataRow, COL.PLAYER1, normalized.players[0] ?? "");
    setCell(dataRow, COL.PLAYER2, normalized.players[1] ?? "");
    setCell(dataRow, COL.PLAYER3, normalized.players[2] ?? "");
    setCell(dataRow, COL.EMAIL, normalized.contactEmail);
    rowNumber += 1;
  });

  return rowNumber;
}

function sanitizeSheetName(name) {
  return String(name || "Csapatok")
    .replace(/[\\/*?:[\]]/g, "")
    .trim()
    .slice(0, 31);
}

function buildFileName(prefix) {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.xlsx`;
}

/**
 * @param {Array<{ title: string, registrations: Array }>} categories
 */
export async function exportTournamentRegistrationsToExcel({
  categories,
  sheetName = "Csapatok",
  fileName = buildFileName("jelentkezok"),
}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sanitizeSheetName(sheetName));
  configureSheetLayout(sheet);

  let rowNumber = appendHeaderRow(sheet, 1);

  const nonEmptyCategories = (categories || []).filter((category) =>
    (category?.registrations || []).some(
      (registration) => !isRegistrationCancelled(registration)
    )
  );

  nonEmptyCategories.forEach((category, index) => {
    rowNumber = appendCategorySection(
      sheet,
      rowNumber,
      category.title,
      category.registrations
    );

    if (index < nonEmptyCategories.length - 1) {
      rowNumber += 1;
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, fileName);
}

export async function exportSingleTournamentRegistrations({
  tournamentTitle,
  registrations,
}) {
  await exportTournamentRegistrationsToExcel({
    categories: [{ title: tournamentTitle, registrations }],
    sheetName: tournamentTitle || "Csapatok",
    fileName: buildFileName(
      `jelentkezok_${String(tournamentTitle || "verseny")
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_áéíóöőúüű-]/gi, "")}`
    ),
  });
}

export async function exportAllTournamentRegistrations(tournaments) {
  await exportTournamentRegistrationsToExcel({
    categories: (tournaments || []).map((tournament) => ({
      title: tournament.title || `Verseny #${tournament.id}`,
      registrations: tournament.registrations || [],
    })),
    sheetName: "Csapatok",
    fileName: buildFileName("jelentkezok_osszes"),
  });
}
