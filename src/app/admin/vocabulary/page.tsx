'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vocabulary } from '@/types';
import { parseCSV } from '@/utils/csvUtils';

interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'html';
  required: boolean;
  options?: string[];
}

export default function VocabularyManagement() {
  // Dynamic Fields Configuration
  const [fields, setFields] = useState<DynamicField[]>([
    { id: '1', name: 'word', label: 'Word', type: 'text', required: true },
    { id: '2', name: 'bengaliMeaning', label: 'Bengali Meaning', type: 'text', required: true },
    { id: '3', name: 'pronunciation', label: 'Pronunciation', type: 'text', required: false },
    { id: '4', name: 'example', label: 'Example Sentence', type: 'textarea', required: false },
    { id: '5', name: 'exampleBengali', label: 'Example Bengali', type: 'textarea', required: false },
    { id: '6', name: 'difficulty', label: 'Difficulty', type: 'select', required: true, options: ['easy', 'medium', 'hard'] },
    { id: '7', name: 'level', label: 'IELTS Level', type: 'text', required: false },
    { id: '8', name: 'partOfSpeech', label: 'Part of Speech', type: 'text', required: false },
    { id: '9', name: 'typeOfSentence', label: 'Type of Sentence', type: 'text', required: false },
    { id: '10', name: 'typeOfTense', label: 'Type of Tense', type: 'text', required: false },
  ]);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [previewField, setPreviewField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vocabularyItems, setVocabularyItems] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'number' | 'select' | 'html'>('text');
  const [duplicates, setDuplicates] = useState<Record<string, string[]>>({});
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchVocabularyItems();
  }, []);

  const fetchVocabularyItems = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'vocabulary'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setVocabularyItems(items);
      detectDuplicates(items);
    } catch (error: any) {
      console.error('Error fetching vocabulary items:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const detectDuplicates = (items: any[]) => {
    const wordMap: Record<string, string[]> = {};
    items.forEach(item => {
      const word = (item.word || '').toLowerCase().trim();
      if (!wordMap[word]) {
        wordMap[word] = [];
      }
      wordMap[word].push(item.id);
    });

    const duplicateMap: Record<string, string[]> = {};
    Object.entries(wordMap).forEach(([word, ids]) => {
      if (ids.length > 1) {
        duplicateMap[word] = ids;
      }
    });
    setDuplicates(duplicateMap);
  };

  const handleAddField = () => {
    if (!newFieldName || !newFieldLabel) {
      alert('Please enter field name and label');
      return;
    }

    const newField: DynamicField = {
      id: Date.now().toString(),
      name: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      label: newFieldLabel,
      type: newFieldType,
      required: false,
    };

    setFields([...fields, newField]);
    setNewFieldName('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setMessage('✅ Field added successfully!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRemoveField = (fieldId: string) => {
    if (confirm('Remove this field?')) {
      setFields(fields.filter(f => f.id !== fieldId));
    }
  };

  const downloadCSVTemplate = () => {
    const headers = fields.map(f => f.name).join(',');
    const csv = headers + '\n';

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'vocabulary_template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this vocabulary item?')) return;

    try {
      await deleteDoc(doc(db, 'vocabulary', itemId));
      setVocabularyItems(vocabularyItems.filter(item => item.id !== itemId));
      detectDuplicates(vocabularyItems.filter(item => item.id !== itemId));
      setMessage('✅ Vocabulary item deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error deleting item: ${error.message}`);
    }
  };

  const handleSelectDuplicate = (itemId: string) => {
    const newSelected = new Set(selectedDuplicates);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedDuplicates(newSelected);
  };

  const handleSelectAllDuplicates = (word: string) => {
    const ids = duplicates[word] || [];
    const newSelected = new Set(selectedDuplicates);
    const allSelected = ids.every(id => newSelected.has(id));

    ids.forEach(id => {
      if (allSelected) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
    });
    setSelectedDuplicates(newSelected);
  };

  const handleBulkDeleteDuplicates = async () => {
    if (selectedDuplicates.size === 0) {
      setMessage('❌ Please select items to delete');
      return;
    }

    if (!confirm(`Delete ${selectedDuplicates.size} selected item(s)? This cannot be undone!`)) return;

    try {
      let successCount = 0;
      for (const itemId of selectedDuplicates) {
        await deleteDoc(doc(db, 'vocabulary', itemId));
        successCount++;
      }

      const updatedItems = vocabularyItems.filter(item => !selectedDuplicates.has(item.id));
      setVocabularyItems(updatedItems);
      detectDuplicates(updatedItems);
      setSelectedDuplicates(new Set());
      setMessage(`✅ Deleted ${successCount} item(s) successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleDeleteAllDuplicates = async () => {
    const allDuplicateIds = Object.values(duplicates).flat();
    if (allDuplicateIds.length === 0) {
      setMessage('❌ No duplicates to delete');
      return;
    }

    if (!confirm(`Delete ALL ${allDuplicateIds.length} duplicate items? This cannot be undone!`)) return;

    try {
      let successCount = 0;
      for (const itemId of allDuplicateIds) {
        await deleteDoc(doc(db, 'vocabulary', itemId));
        successCount++;
      }

      const updatedItems = vocabularyItems.filter(item => !allDuplicateIds.includes(item.id));
      setVocabularyItems(updatedItems);
      detectDuplicates(updatedItems);
      setSelectedDuplicates(new Set());
      setMessage(`✅ Deleted ${successCount} duplicate item(s) successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleClearAll = async () => {
    if (vocabularyItems.length === 0) {
      setMessage('❌ No items to delete');
      return;
    }

    if (!confirm(`Delete ALL ${vocabularyItems.length} vocabulary items? This cannot be undone!`)) return;
    if (!confirm('Are you REALLY sure? This will delete everything!')) return;

    try {
      let successCount = 0;
      for (const item of vocabularyItems) {
        await deleteDoc(doc(db, 'vocabulary', item.id));
        successCount++;
      }

      setVocabularyItems([]);
      setDuplicates({});
      setSelectedDuplicates(new Set());
      setMessage(`✅ Deleted ${successCount} item(s) successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'vocabulary', itemId), editFormData);
      setVocabularyItems(vocabularyItems.map(item =>
        item.id === itemId ? { ...item, ...editFormData } : item
      ));
      setEditingId(null);
      setMessage('✅ Vocabulary item updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error updating item: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvLoading(true);
    setMessage('');

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setMessage('❌ No valid data found in CSV');
        setCsvLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          const docData: Record<string, any> = {};
          fields.forEach(field => {
            docData[field.name] = row[field.name] || '';
          });
          docData.createdAt = new Date();

          await addDoc(collection(db, 'vocabulary'), docData);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      await fetchVocabularyItems();
      setMessage(`✅ Uploaded ${successCount} items${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setCsvLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'vocabulary'), {
        ...formData,
        createdAt: new Date(),
      });

      setMessage('✅ Vocabulary added successfully!');
      setFormData({});
      await fetchVocabularyItems();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (field: DynamicField, value: any, onChange: (val: any) => void) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            rows={3}
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'html':
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
              rows={4}
              placeholder="Enter HTML content"
            />
            <button
              type="button"
              onClick={() => setPreviewField(previewField === field.name ? null : field.name)}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {previewField === field.name ? 'Hide' : 'Show'} Preview
            </button>
            {previewField === field.name && (
              <div className="p-3 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700">
                <div dangerouslySetInnerHTML={{ __html: value || '' }} />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">📚 Manage Vocabulary</h1>
        <button
          onClick={() => setShowFieldManager(!showFieldManager)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
        >
          {showFieldManager ? 'Close' : 'Manage'} Fields
        </button>
      </div>

      {/* Duplicate Detection */}
      {Object.keys(duplicates).length > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border-2 border-amber-300 dark:border-amber-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
              ⚠️ Found {Object.keys(duplicates).length} Duplicate Word(s)
            </h2>
            <button
              onClick={() => setShowDuplicates(!showDuplicates)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition"
            >
              {showDuplicates ? 'Hide' : 'Show'} Duplicates
            </button>
          </div>

          {showDuplicates && (
            <div className="space-y-3">
              {Object.entries(duplicates).map(([word, ids]) => (
                <div key={word} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      "{word}" - {ids.length} occurrences
                    </h3>
                    <button
                      onClick={() => handleSelectAllDuplicates(word)}
                      className="text-sm px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                    >
                      {ids.every(id => selectedDuplicates.has(id)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ids.map(id => {
                      const item = vocabularyItems.find(v => v.id === id);
                      return (
                        <label key={id} className="flex items-center gap-3 p-2 bg-amber-50 dark:bg-amber-900/10 rounded hover:bg-amber-100 dark:hover:bg-amber-900/20 transition cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDuplicates.has(id)}
                            onChange={() => handleSelectDuplicate(id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item?.bengaliMeaning || 'N/A'}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{item?.pronunciation || 'No pronunciation'}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-4 border-t border-amber-200 dark:border-amber-700 flex-wrap">
                {selectedDuplicates.size > 0 && (
                  <>
                    <button
                      onClick={handleBulkDeleteDuplicates}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition min-w-fit"
                    >
                      🗑️ Delete {selectedDuplicates.size} Selected
                    </button>
                    <button
                      onClick={() => setSelectedDuplicates(new Set())}
                      className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white font-semibold rounded-lg transition"
                    >
                      Clear Selection
                    </button>
                  </>
                )}
                <button
                  onClick={handleDeleteAllDuplicates}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition min-w-fit"
                >
                  🗑️ Delete All {Object.keys(duplicates).length} Duplicates
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field Manager */}
      {showFieldManager && (
        <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-2 border-purple-300 dark:border-purple-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Dynamic Field Manager</h2>

          <div className="space-y-3 mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Current Fields:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {fields.map(field => (
                <div key={field.id} className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-300 dark:border-slate-600 flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{field.label}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{field.type}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveField(field.id)}
                    className="text-red-600 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-purple-300 dark:border-purple-700 pt-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Add New Field:</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Field Name (word)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Field Label (Word)"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="html">HTML</option>
              </select>
              <button
                onClick={handleAddField}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add New Word</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderFormField(field, formData[field.name], (val) => {
                  setFormData({ ...formData, [field.name]: val });
                })}
              </div>
            ))}

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('✅')
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Vocabulary'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-600">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">📥 Batch Upload CSV</h3>
            <button
              onClick={downloadCSVTemplate}
              className="w-full mb-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Download CSV Template
            </button>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVUpload}
                disabled={csvLoading}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <button
                disabled={csvLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {csvLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        {/* Management */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">📋 Manage Words ({vocabularyItems.length})</h2>
            {vocabularyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-sm"
              >
                ⚠️ Clear All
              </button>
            )}
          </div>

          {dataLoading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading...</div>
          ) : vocabularyItems.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">No vocabulary items yet</div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {vocabularyItems.map((item) => {
                const isDuplicate = Object.values(duplicates).flat().includes(item.id);
                return (
                <div key={item.id} className={`border rounded-lg p-4 ${isDuplicate ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30'}`}>
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      {fields.map(field => (
                        <div key={field.id}>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{field.label}</label>
                          {renderFormField(field, editFormData[field.name], (val) => {
                            setEditFormData({ ...editFormData, [field.name]: val });
                          })}
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleUpdateItem(item.id)}
                          className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-3 py-1 bg-slate-400 hover:bg-slate-500 text-white text-sm font-semibold rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{item.word}</h3>
                        {isDuplicate && <span className="text-xs px-2 py-1 bg-amber-600 text-white rounded font-semibold">⚠️ DUPLICATE</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        {fields.filter(f => f.name !== 'word').map(field => (
                          item[field.name] && (
                            <div key={field.id}>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{field.label}:</p>
                              <p className="text-slate-900 dark:text-white line-clamp-1">{item[field.name]}</p>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
