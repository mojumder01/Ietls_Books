'use client';

import DynamicSectionAdmin from '@/components/DynamicSectionAdmin';

const DEFAULT_FIELDS = [
  { id: '1', name: 'text', label: 'Tongue Twister Text', type: 'textarea' as const, required: true },
  { id: '2', name: 'soundFocus', label: 'Sound Focus', type: 'text' as const, required: false },
  { id: '3', name: 'explanation', label: 'Explanation', type: 'textarea' as const, required: false },
  { id: '4', name: 'tips', label: 'Tips for Pronunciation', type: 'textarea' as const, required: false },
  { id: '5', name: 'difficulty', label: 'Difficulty', type: 'select' as const, required: true, options: ['easy', 'medium', 'hard'] },
  { id: '6', name: 'language', label: 'Language', type: 'select' as const, required: false, options: ['English', 'English with Accents'] },
];

export default function TongueTwistersManagement() {
  return <DynamicSectionAdmin title="Tongue Twisters" collectionName="tongue_twisters" defaultFields={DEFAULT_FIELDS} />;
}
