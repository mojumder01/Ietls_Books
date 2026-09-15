'use client';

import DynamicSectionAdmin from '@/components/DynamicSectionAdmin';

const DEFAULT_FIELDS = [
  { id: '1', name: 'title', label: 'Title', type: 'text' as const, required: true },
  { id: '2', name: 'content', label: 'Content', type: 'textarea' as const, required: true },
  { id: '3', name: 'rules', label: 'Rules', type: 'textarea' as const, required: false },
  { id: '4', name: 'examples', label: 'Examples', type: 'textarea' as const, required: false },
  { id: '5', name: 'difficulty', label: 'Difficulty', type: 'select' as const, required: true, options: ['easy', 'medium', 'hard'] },
  { id: '6', name: 'level', label: 'IELTS Level', type: 'text' as const, required: false },
  { id: '7', name: 'youtubeLink', label: 'YouTube Link', type: 'text' as const, required: false },
];

export default function GrammarManagement() {
  return <DynamicSectionAdmin title="Grammar" collectionName="grammar" defaultFields={DEFAULT_FIELDS} />;
}
