export function useIndianFormat() {
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '₹0';
    
    const num = Number(value);
    
    // Indian formatting algorithm for numbers (e.g., 1,25,000)
    const parts = num.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    
    const formatted = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return '₹' + formatted + (parts[1] !== '00' ? '.' + parts[1] : '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    // If it's full datetime or ISO string
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }

    // If it's HH:mm:ss format
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1] || '00';
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }

    return timeString;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;
    
    return `${day}/${month}/${year} ${strTime}`;
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+91 ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    return phone;
  };

  return {
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    formatPhone
  };
}
