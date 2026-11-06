export function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
  const num = Number(value);
  const formatted = Math.abs(num).toLocaleString('id-ID');
  return num < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  // reset hours
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
