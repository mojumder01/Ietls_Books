'use client';

import DynamicSectionAdmin from '@/components/DynamicSectionAdmin';

const DEFAULT_FIELDS = [
  { id: '1', name: 'title', label: 'Title', type: 'text' as const, required: true },
  { id: '2', name: 'audioUrl', label: 'Audio URL', type: 'text' as const, required: true },
  { id: '3', name: 'transcript', label: 'Transcript', type: 'textarea' as const, required: false },
  { id: '4', name: 'questions', label: 'Questions', type: 'textarea' as const, required: true },
  { id: '5', name: 'answers', label: 'Answers', type: 'textarea' as const, required: false },
  { id: '6', name: 'difficulty', label: 'Difficulty', type: 'select' as const, required: true, options: ['easy', 'medium', 'hard'] },
  { id: '7', name: 'level', label: 'IELTS Level', type: 'text' as const, required: false },
];

export default function ListeningManagement() {
  return <DynamicSectionAdmin title="Listening" collectionName="listening" defaultFields={DEFAULT_FIELDS} />;
}
