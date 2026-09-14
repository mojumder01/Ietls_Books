'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PronunciationLesson } from '@/types';

export default function Pronunciation() {
  const [lessons, setLessons] = useState<PronunciationLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<PronunciationLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pronunciation_lessons'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PronunciationLesson[];
        setLessons(data);
      } catch (error) {
        console.error('Error fetching pronunciation lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return <div className="p-6">Loading pronunciation lessons...</div>;
  }

  if (selectedLesson) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedLesson(null)}
          className="mb-6 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          ← Back to Lessons
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {selectedLesson.title}
          </h1>

          <div className="space-y-6">
            {selectedLesson.audioUrl && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Listen</h2>
                <audio
                  src={selectedLesson.audioUrl}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Explanation</h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {selectedLesson.explanation}
              </p>
            </div>

            {selectedLesson.examples && selectedLesson.examples.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Examples</h2>
                <div className="space-y-2">
                  {selectedLesson.examples.map((example, idx) => (
                    <div key={idx} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-slate-900 dark:text-white">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLesson.tips && selectedLesson.tips.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Tips</h2>
                <ul className="space-y-2">
                  {selectedLesson.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-3">💡</span>
                      <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">🔊 Pronunciation Guide</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => setSelectedLesson(lesson)}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{lesson.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
              {lesson.explanation}
            </p>
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
              Learn More
            </button>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No pronunciation lessons available yet</p>
        </div>
      )}
    </div>
  );
}
