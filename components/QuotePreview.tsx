'use client';

import { useRef } from 'react';
import { QuoteItem, QuoteConfig } from '@/lib/csv-utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuotePreviewProps {
  clientName: string;
  items: QuoteItem[];
  total: number;
  config: QuoteConfig;
  onClose: () => void;
}

export default function QuotePreview({ clientName, items, total, config, onClose }: QuotePreviewProps) {
  const quoteRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!quoteRef.current) return;

    try {
      const canvas = await html2canvas(quoteRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`quote-${clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (config.validity_days || 30));

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quote Preview</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Quote Document */}
      <div ref={quoteRef} className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{config.company_name}</h1>
              <p className="text-gray-600 mt-2">Professional SaaS Solutions</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>{config.company_email}</p>
                <p>{config.phone}</p>
                <p className="mt-1">{config.address}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary-600">QUOTE</h2>
              <p className="text-gray-600 text-sm">Date: {formatDate(new Date())}</p>
              <p className="text-gray-600 text-sm">Valid until: {formatDate(validUntil)}</p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">To:</h3>
          <p className="text-gray-700 font-medium">{clientName}</p>
        </div>

        {/* Products Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-900">Product/Service</th>
                <th className="text-right py-3 font-semibold text-gray-900">Quantity</th>
                <th className="text-right py-3 font-semibold text-gray-900">Duration</th>
                <th className="text-right py-3 font-semibold text-gray-900">Unit Price</th>
                <th className="text-right py-3 font-semibold text-gray-900">Discount</th>
                <th className="text-right py-3 font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(items) && items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.productId || index} className={index < items.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName || 'Unknown Product'}</p>
                      </div>
                    </td>
                    <td className="py-3 text-right text-gray-700">{item.quantity || 1}</td>
                    <td className="py-3 text-right text-gray-700">{item.duration || 1} months</td>
                    <td className="py-3 text-right text-gray-700">${(item.price || 0).toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-700">
                      {item.discount > 0 ? `${item.discount}%` : '-'}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      ${(item.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No items found in this quote
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                Total: ${(total || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        {config.terms_and_conditions && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Terms and Conditions</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{config.terms_and_conditions}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">{config.footer_message}</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Quote ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <p>Generated on {formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="mt-6 text-center">
        <button
          onClick={downloadPDF}
          className="btn-primary"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
} 