import * as XLSX from 'xlsx';
import type { Registration } from './types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'التسجيل الأولي',
  CONFIRMED: 'تم تأكيد التسجيل',
};

export function exportToExcel(registrations: Registration[], groupNumber: 1 | 2): void {
  const fileName = `Fouj_${groupNumber}_Boutemdjet_Faiza.xlsx`;

  const data = registrations.map((reg, index) => ({
    'N°': index + 1,
    'Nom': reg.first_name,
    'Prénom': reg.last_name,
    'Téléphone': reg.phone,
    'Statut': STATUS_LABELS[reg.status] ?? reg.status,
    "Date d'inscription": new Date(reg.created_at).toLocaleDateString('fr-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 5 },   // N°
    { wch: 20 },  // Nom
    { wch: 20 },  // Prénom
    { wch: 15 },  // Téléphone
    { wch: 25 },  // Statut
    { wch: 18 },  // Date
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    ws,
    `Fouj ${groupNumber}`
  );

  // Add metadata
  wb.Props = {
    Title: `Fouj ${groupNumber} — Boutemdjet Faiza`,
    Author: 'Système de Gestion des Cours de Soutien',
  };

  XLSX.writeFile(wb, fileName);
}
