export function useWhatsApp() {
  const openWhatsApp = (phone, message = '') => {
    // Strip non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Format Indian number specifically
    // If it's a 10-digit number, prepend 91
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // Correct already
    }

    const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return {
    openWhatsApp
  };
}
