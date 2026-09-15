'use client';

import DynamicSectionAdmin from '@/components/DynamicSectionAdmin';

const DEFAULT_FIELDS = [
  { id: '1', name: 'title', label: 'Speaking Topic', type: 'text' as const, required: true },
  { id: '2', name: 'question', label: 'Question', type: 'textarea' as const, required: true },
  { id: '3', name: 'sampleAnswer', label: 'Sample Answer', type: 'textarea' as const, required: false },
  { id: '4', name: 'tips', label: 'Tips & Guidance', type: 'textarea' as const, required: false },
  { id: '5', name: 'vocabulary', label: 'Key Vocabulary', type: 'textarea' as const, required: false },
  { id: '6', name: 'difficulty', label: 'Difficulty', type: 'select' as const, required: true, options: ['easy', 'medium', 'hard'] },
  { id: '7', name: 'level', label: 'IELTS Level', type: 'text' as const, required: false },
];

export default function SpeakingManagement() {
  return <DynamicSectionAdmin title="Speaking" collectionName="speaking_practices" defaultFields={DEFAULT_FIELDS} />;
}
