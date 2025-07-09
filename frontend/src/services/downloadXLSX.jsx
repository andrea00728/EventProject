import * as XLSX from "xlsx";

export function handleDownloadXLSX(data, name) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Personnels");
  XLSX.writeFile(workbook, `${name}.xlsx`);
}