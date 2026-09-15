'use client';

import DynamicSectionAdmin from '@/components/DynamicSectionAdmin';

const DEFAULT_FIELDS = [
  { id: '1', name: 'title', label: 'Title', type: 'text' as const, required: true },
  { id: '2', name: 'passage', label: 'Reading Passage', type: 'textarea' as const, required: true },
  { id: '3', name: 'questions', label: 'Questions', type: 'textarea' as const, required: true },
  { id: '4', name: 'answers', label: 'Answers', type: 'textarea' as const, required: false },
  { id: '5', name: 'difficulty', label: 'Difficulty', type: 'select' as const, required: true, options: ['easy', 'medium', 'hard'] },
  { id: '6', name: 'level', label: 'IELTS Level', type: 'text' as const, required: false },
  { id: '7', name: 'category', label: 'Category', type: 'text' as const, required: false },
];

export default function ReadingManagement() {
  return <DynamicSectionAdmin title="Reading" collectionName="reading" defaultFields={DEFAULT_FIELDS} />;
}
