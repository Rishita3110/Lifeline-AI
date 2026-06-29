// Parse deadline time from unstructured input text
export function parseDeadlineFromText(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // Look for HH:MM pattern (with optional AM/PM)
  const hhmmMatch = lower.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (hhmmMatch) {
    let hours = parseInt(hhmmMatch[1], 10);
    const minutes = hhmmMatch[2];
    const ampm = hhmmMatch[3];
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes}`;
  }
  
  // Look for single number pm/am (e.g., "5pm", "5 pm", "11 am")
  const ampmMatch = lower.match(/(\d{1,2})\s*(am|pm)/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const ampm = ampmMatch[2];
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    return `${hours < 10 ? '0' : ''}${hours}:00`;
  }

  // Common keywords
  if (lower.includes("midnight")) {
    return "23:59";
  }
  if (lower.includes("noon")) {
    return "12:00";
  }
  
  return null;
}

// Parse deadline date from unstructured input text
export function parseDateFromText(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  const today = new Date();
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  if (lower.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return formatDate(tomorrow);
  }
  if (lower.includes("today")) {
    return formatDate(today);
  }
  
  // Check for specific date patterns like June 29, 06/29, 6-29, 29th
  const dateMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})/);
  if (dateMatch) {
    const monthStr = dateMatch[1];
    const day = parseInt(dateMatch[2], 10);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthIndex = months.indexOf(monthStr);
    if (monthIndex !== -1) {
      const targetDate = new Date(today.getFullYear(), monthIndex, day);
      if (targetDate < today && (today.getTime() - targetDate.getTime() > 24 * 60 * 60 * 1000)) {
        targetDate.setFullYear(today.getFullYear() + 1);
      }
      return formatDate(targetDate);
    }
  }
  
  // MM/DD pattern
  const mmddMatch = lower.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (mmddMatch) {
    const month = parseInt(mmddMatch[1], 10) - 1;
    const day = parseInt(mmddMatch[2], 10);
    const targetDate = new Date(today.getFullYear(), month, day);
    if (targetDate < today && (today.getTime() - targetDate.getTime() > 24 * 60 * 60 * 1000)) {
      targetDate.setFullYear(today.getFullYear() + 1);
    }
    return formatDate(targetDate);
  }

  return formatDate(today); // Default to today's date!
}
