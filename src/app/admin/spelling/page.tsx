'use client';

import DynamicSectionAdmin from '@/components/DynamicSectionAdmin';

const DEFAULT_FIELDS = [
  { id: '1', name: 'word', label: 'Word', type: 'text' as const, required: true },
  { id: '2', name: 'correctSpelling', label: 'Correct Spelling', type: 'text' as const, required: true },
  { id: '3', name: 'meaning', label: 'Meaning', type: 'textarea' as const, required: false },
  { id: '4', name: 'commonMistakes', label: 'Common Mistakes', type: 'textarea' as const, required: false },
  { id: '5', name: 'example', label: 'Example Sentence', type: 'textarea' as const, required: false },
  { id: '6', name: 'difficulty', label: 'Difficulty', type: 'select' as const, required: true, options: ['easy', 'medium', 'hard'] },
  { id: '7', name: 'level', label: 'IELTS Level', type: 'text' as const, required: false },
];

export default function SpellingManagement() {
  return <DynamicSectionAdmin title="Spelling" collectionName="spelling" defaultFields={DEFAULT_FIELDS} />;
}
