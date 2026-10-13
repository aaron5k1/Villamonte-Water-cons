import { IntakeLog, UnitType } from '../types';

export function exportLogsToCSV(logs: IntakeLog[], unit: UnitType, userName: string = 'User') {
  if (logs.length === 0) {
    alert('No logs recorded today to export.');
    return;
  }

  const headers = ['ID', 'Date', 'Time', `Amount (${unit})`, 'Beverage Type', 'Notes'];

  const rows = logs.map((log) => {
    const d = new Date(log.timestamp);
    const dateStr = d.toLocaleDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const amountStr = unit === 'oz' ? (log.amount * 0.033814).toFixed(1) : log.amount.toString();
    const cleanNote = (log.note || '').replace(/"/g, '""');

    return [
      log.id,
      dateStr,
      timeStr,
      amountStr,
      log.drinkType,
      `"${cleanNote}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `water_cons_${userName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
