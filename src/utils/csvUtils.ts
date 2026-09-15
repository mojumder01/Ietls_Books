export function downloadCSVTemplate(filename: string, headers: string[]) {
  const csvContent = headers.join(',');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle quoted values that might contain commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
}

export const VOCABULARY_CSV_HEADERS = [
  'word',
  'bengaliMeaning',
  'pronunciation',
  'example',
  'exampleBengali',
  'difficulty',
  'level',
  'partOfSpeech'
];

export const GRAMMAR_CSV_HEADERS = [
  'topic',
  'explanation',
  'bengaliExplanation',
  'examples',
  'difficulty',
  'level'
];

export const READING_CSV_HEADERS = [
  'title',
  'passage',
  'questions',
  'difficulty',
  'level'
];

export const SPELLING_CSV_HEADERS = [
  'pronunciation',
  'correctSpelling'
];

export const PRONUNCIATION_CSV_HEADERS = [
  'word',
  'pronunciation',
  'meaning',
  'level'
];

export const TONGUETWISTERS_CSV_HEADERS = [
  'text',
  'difficulty',
  'level'
];

export const LISTENING_CSV_HEADERS = [
  'title',
  'audioUrl',
  'transcript',
  'questions',
  'difficulty',
  'level'
];

export const WRITING_CSV_HEADERS = [
  'prompt',
  'difficulty',
  'level',
  'timeLimit'
];

export const SPEAKING_CSV_HEADERS = [
  'prompt',
  'difficulty',
  'level',
  'timeLimit'
];

export const BOOKS_CSV_HEADERS = [
  'title',
  'author',
  'description',
  'difficulty',
  'level',
  'coverUrl'
];
