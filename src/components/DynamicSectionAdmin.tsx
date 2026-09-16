'use client';

import { useState, useRef, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'html';
  required: boolean;
  options?: string[];
}

interface DynamicSectionAdminProps {
  title: string;
  collectionName: string;
  defaultFields: DynamicField[];
}

export default function DynamicSectionAdmin({
  title,
  collectionName,
  defaultFields,
}: DynamicSectionAdminProps) {
  const [fields, setFields] = useState<DynamicField[]>(defaultFields);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [previewField, setPreviewField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'number' | 'select' | 'html'>('text');

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const fetchItems = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedItems = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setItems(fetchedItems);
    } catch (error: any) {
      console.error(`Error fetching ${collectionName} items:`, error);
    } finally {
      setDataLoading(false);
    }
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
      setFields(fields.filter((f) => f.id !== fieldId));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm(`Delete this ${title.toLowerCase()}?`)) return;

    try {
      await deleteDoc(doc(db, collectionName, itemId));
      setItems(items.filter((item) => item.id !== itemId));
      setMessage(`✅ ${title} deleted successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error deleting: ${error.message}`);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      await updateDoc(doc(db, collectionName, itemId), editFormData);
      setItems(items.map((item) =>
        item.id === itemId ? { ...item, ...editFormData } : item
      ));
      setEditingId(null);
      setMessage(`✅ ${title} updated successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error updating: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, collectionName), {
        ...formData,
        createdAt: new Date(),
      });

      setMessage(`✅ ${title} added successfully!`);
      setFormData({});
      await fetchItems();

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (
    field: DynamicField,
    value: any,
    onChange: (val: any) => void
  ) => {
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
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
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
              onClick={() =>
                setPreviewField(previewField === field.name ? null : field.name)
              }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex-shrink-0">
          📝 Manage {title}
        </h1>
        <button
          type="button"
          onClick={() => setShowFieldManager(!showFieldManager)}
          className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold rounded-lg transition whitespace-nowrap z-10 flex items-center justify-center gap-2"
        >
          <span>{showFieldManager ? '✓' : '⚙️'}</span>
          <span>{showFieldManager ? 'Close' : 'Manage'} Fields</span>
        </button>
      </div>

      {/* Field Manager */}
      {showFieldManager && (
        <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-2 border-purple-300 dark:border-purple-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Dynamic Field Manager
          </h2>

          <div className="space-y-3 mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              Current Fields:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-300 dark:border-slate-600 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {field.label}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {field.type}
                    </p>
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
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Add New Field:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Field Name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Field Label"
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Add New
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map((field) => (
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
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('✅')
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        {/* Management */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            📋 Manage ({items.length})
          </h2>

          {dataLoading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              No items yet
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/30"
                >
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      {fields.map((field) => (
                        <div key={field.id}>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}
                          </label>
                          {renderFormField(field, editFormData[field.name], (val) => {
                            setEditFormData({
                              ...editFormData,
                              [field.name]: val,
                            });
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
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                        {item[fields[0]?.name] || 'Item'}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        {fields
                          .filter((f) => f.name !== fields[0]?.name)
                          .slice(0, 3)
                          .map((field) =>
                            item[field.name] ? (
                              <div key={field.id}>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {field.label}:
                                </p>
                                <p className="text-slate-900 dark:text-white line-clamp-1">
                                  {item[field.name]}
                                </p>
                              </div>
                            ) : null
                          )}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
