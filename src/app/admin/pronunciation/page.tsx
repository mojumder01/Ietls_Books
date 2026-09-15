'use client';

import DynamicSectionAdmin from '@/components/DynamicSectionAdmin';

const DEFAULT_FIELDS = [
  { id: '1', name: 'word', label: 'Word', type: 'text' as const, required: true },
  { id: '2', name: 'pronunciation', label: 'Pronunciation (IPA)', type: 'text' as const, required: true },
  { id: '3', name: 'audioUrl', label: 'Audio URL', type: 'text' as const, required: false },
  { id: '4', name: 'meaning', label: 'Meaning', type: 'textarea' as const, required: false },
  { id: '5', name: 'tips', label: 'Pronunciation Tips', type: 'textarea' as const, required: false },
  { id: '6', name: 'difficulty', label: 'Difficulty', type: 'select' as const, required: true, options: ['easy', 'medium', 'hard'] },
  { id: '7', name: 'level', label: 'IELTS Level', type: 'text' as const, required: false },
];

export default function PronunciationManagement() {
  return <DynamicSectionAdmin title="Pronunciation" collectionName="pronunciation_words" defaultFields={DEFAULT_FIELDS} />;
}
