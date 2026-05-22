const CELL_BASE =
  "flex items-center justify-center break-words border-r border-b border-black overflow-hidden";

export function getPrintCellClasses(kind) {
  if (kind === "reservation") {
    return `${CELL_BASE} bg-amber-500 font-bold text-white`;
  }
  if (kind === "tournament") {
    return `${CELL_BASE} bg-blue-500 font-bold text-white`;
  }
  return `${CELL_BASE} bg-white text-black`;
}

export const PRINT_HEADER_CELL =
  "border-b border-black bg-[#f3f7ff] text-center font-bold";

export const PRINT_HOUR_CELL =
  "border-r border-black bg-[#f3f7ff] text-center";
