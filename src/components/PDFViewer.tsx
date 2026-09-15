'use client';

import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message || 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-8 min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Failed to Load PDF</h3>
        <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
        >
          Open PDF in New Tab
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg transition font-semibold"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold">
            Page {currentPage} / {numPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === numPages}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg transition font-semibold"
          >
            Next →
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Zoom:</label>
          <button
            onClick={() => setScale(Math.max(0.8, scale - 0.2))}
            className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            −
          </button>
          <span className="w-12 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(3, scale + 0.2))}
            className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            +
          </button>
        </div>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold whitespace-nowrap"
        >
          📥 Download
        </a>
      </div>

      {/* PDF Display using iframe */}
      <div className="bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden shadow">
        <iframe
          src={`${pdfUrl}#page=${currentPage}`}
          className="w-full min-h-screen"
          title={title || 'PDF Viewer'}
        />
      </div>
    </div>
  );
}
