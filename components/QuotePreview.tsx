'use client';

import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuotePreviewProps {
  quote: any;
  children?: React.ReactNode;
  onEditQuote?: (quote: any) => void;
  onViewQuote?: (quote: any) => void;
  onDuplicateQuote?: (quote: any) => void;
  onDeleteQuote?: (quote: any) => void;
  onGenerateQuote?: (quote: any) => void;
  // Controlled mode (optional): when provided, the parent manages open/close state
  isOpenExternal?: boolean;
  onRequestClose?: () => void;
}

export default function QuotePreview({ 
  quote, 
  children,
  onEditQuote, 
  onViewQuote, 
  onDuplicateQuote, 
  onDeleteQuote, 
  onGenerateQuote,
  isOpenExternal,
  onRequestClose,
}: QuotePreviewProps) {
  const quoteRef = useRef<HTMLDivElement>(null);
  const [showGenerateConfirmation, setShowGenerateConfirmation] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isControlled = typeof isOpenExternal !== 'undefined';
  const isModalOpen = isControlled ? Boolean(isOpenExternal) : isOpen;

  const handleClose = () => {
    if (isControlled) {
      onRequestClose?.();
    } else {
      setIsOpen(false);
    }
  };

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
      pdf.save(`quote-${quote.clientName?.replace(/\s+/g, '-').toLowerCase() || 'quote'}.pdf`);
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

  const handleGenerateQuote = () => {
    setShowGenerateConfirmation(true);
  };

  const confirmGenerateQuote = () => {
    if (onGenerateQuote) {
      onGenerateQuote(quote);
    }
    setShowGenerateConfirmation(false);
    handleClose();
  };

  const handleEditQuote = () => {
    if (onEditQuote) {
      onEditQuote(quote);
    }
    handleClose();
  };

  const handleViewQuote = () => {
    if (onViewQuote) {
      onViewQuote(quote);
    }
    handleClose();
  };

  const handleDuplicateQuote = () => {
    if (onDuplicateQuote) {
      onDuplicateQuote(quote);
    }
    handleClose();
  };

  const handleDeleteQuote = () => {
    if (onDeleteQuote) {
      onDeleteQuote(quote);
    }
    handleClose();
  };

  const openModal = () => {
    if (!isControlled) {
      setIsOpen(true);
    }
  };

  if (!quote) return null;

  const normalizedStatus = String(quote.status || '').toLowerCase();
  const isDraft = normalizedStatus === 'draft';
  const isCompleted = normalizedStatus === 'completed';
  const isGenerated = normalizedStatus === 'generated' || isCompleted;

  // Default config values
  const config = {
    company_name: 'Your Company Name',
    company_email: 'contact@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345',
    validity_days: 30
  };

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (config.validity_days || 30));

  return (
    <>
      {/* Trigger wrapper: only interactive in uncontrolled mode */}
      {isControlled ? (
        <>{children}</>
      ) : (
        <div onClick={openModal} className="cursor-pointer">{children}</div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Quote Preview</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quote Details */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quote Reference</h4>
                  <p className="text-gray-600">{quote.quoteReference || 'Untitled Quote'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Client</h4>
                  <p className="text-gray-600">{quote.clientName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Company</h4>
                  <p className="text-gray-600">{quote.companyName || '-'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isDraft ? 'Draft' : isCompleted ? 'Completed' : 'Generated'}
                  </span>
                </div>
              </div>
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
                    <h2 className="text-2xl font-bold text-blue-600">QUOTE</h2>
                    <p className="text-gray-600 text-sm">Date: {formatDate(new Date())}</p>
                    <p className="text-gray-600 text-sm">Valid until: {formatDate(validUntil)}</p>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">To:</h3>
                <p className="text-gray-700 font-medium">{quote.clientName}</p>
                {quote.companyName && (
                  <p className="text-gray-600">{quote.companyName}</p>
                )}
              </div>

              {/* Products Table */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items && quote.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-sm text-gray-600">
                              {item.duration} {item.duration === 1 ? 'month' : 'months'}
                            </p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          ${item.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          ${item.total?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td className="py-3 px-4 font-semibold text-gray-900">Total</td>
                      <td></td>
                      <td className="text-right py-3 px-4 font-bold text-lg text-gray-900">
                        ${quote.total?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                <p className="text-sm text-gray-600">
                  This quote is valid for {config.validity_days} days from the date of issue. 
                  Payment terms are net 30 days unless otherwise specified.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              {/* Normal Buttons */}
              {isGenerated && (
                <button
                  onClick={downloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Download Quote
                </button>
              )}
              
              {isDraft && (
                <button
                  onClick={handleGenerateQuote}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Generate Quote
                </button>
              )}

              {/* Icon Buttons */}
              <div className="flex gap-2">
                {isDraft && (
                  <button
                    onClick={handleEditQuote}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors duration-200"
                    title="Edit Quote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}

                {isGenerated && (
                  <button
                    onClick={handleViewQuote}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors duration-200"
                    title="View Quote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={handleDuplicateQuote}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors duration-200"
                  title="Duplicate Quote"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {isDraft && (
                  <button
                    onClick={handleDeleteQuote}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors duration-200"
                    title="Delete Quote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Quote Confirmation Modal */}
      {showGenerateConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Quote Generation</h3>
              <p className="text-gray-600 mb-6">
                Once the quote is generated, you will not be able to edit it, only duplicate it.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerateConfirmation(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmGenerateQuote}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Generate Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 