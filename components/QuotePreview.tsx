'use client';

import { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QuoteCostSummary from './QuoteCostSummary';

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
  const [quoteConfig, setQuoteConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  const isControlled = typeof isOpenExternal !== 'undefined';
  const isModalOpen = isControlled ? Boolean(isOpenExternal) : isOpen;

  const handleClose = () => {
    if (isControlled) {
      onRequestClose?.();
    } else {
      setIsOpen(false);
    }
  };

  // Fetch quote configuration
  useEffect(() => {
    const fetchQuoteConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        setQuoteConfig(data);
      } catch (error) {
        console.error('Error fetching quote config:', error);
      }
    };
    
    if (isModalOpen) {
      fetchQuoteConfig();
    }
  }, [isModalOpen]);

  // Fetch products for cost calculations (to mirror QuoteForm summary)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (isModalOpen) {
      fetchProducts();
    }
  }, [isModalOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

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
  const isGenerated = normalizedStatus === 'generated';

  // Use fetched config or fallback to defaults
  const config = quoteConfig || {
    company_name: 'Your Company Name',
    company_email: 'contact@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345',
    validity_days: 30
  };

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (config.validity_days || 30));

  // Parse persisted quote data (support both arrays and JSON-strings)
  const toArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      try { return JSON.parse(value); } catch { return []; }
    }
    return [];
  };

  const parsedProductConfigurations: Array<any> = toArray(quote.productConfigurations);
  const parsedCustomRequirements: Array<any> = toArray(quote.customRequirements);
  const parsedDiscounts: Array<any> = toArray(quote.discounts);

  // Calculate total cost for quote summary (mirrors QuoteForm)
  const calculateTotalCost = () => {
    let total = 0;
    const breakdown = {
      products: 0,
      setupCosts: 0,
      addons: 0,
      customRequirements: 0,
      discounts: 0,
      total: 0,
    };

    // Product configurations (plans, setup fees, addons, per-product discounts)
    parsedProductConfigurations.forEach((config: any) => {
      const selectedProduct = products.find((p: any) => String(p.id) === String(config.productId));
      if (!selectedProduct) return;

      // Plan price
      try {
        const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
        const selectedPlan = pricingPlans.find((plan: any) => String(plan.id) === String(config.planId));
        if (selectedPlan && selectedPlan.pricingOptions) {
          const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
          if (pricingOption) {
            const planPrice = parseFloat(pricingOption.price) || 0;
            breakdown.products += planPrice;
            total += planPrice;
          }
        }
      } catch {}

      // Setup cost
      if (config.includeSetupCost && selectedProduct.setup_fee) {
        const setupCost = Number(selectedProduct.setup_fee) || 0;
        breakdown.setupCosts += setupCost;
        total += setupCost;
      }

      // Addons
      try {
        const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
        (config.selectedAddons || []).forEach((addonId: string) => {
          const addon = customElements.find((a: any) => String(a.id) === String(addonId));
          if (addon) {
            const addonCost = parseFloat(addon.additional_cost) || 0;
            breakdown.addons += addonCost;
            total += addonCost;
          }
        });
      } catch {}

      // Product-level discount
      if (config.discountValue > 0) {
        let discountAmount = 0;
        if (config.discountType === 'percentage') {
          discountAmount = (breakdown.products * Number(config.discountValue)) / 100;
        } else {
          discountAmount = Number(config.discountValue);
        }
        breakdown.discounts += discountAmount;
        total -= discountAmount;
      }
    });

    // Custom requirements
    parsedCustomRequirements.forEach((req: any) => {
      const requirementCost = parseFloat(req.price) || 0;
      breakdown.customRequirements += requirementCost;
      total += requirementCost;
    });

    // Overall discounts
    parsedDiscounts.forEach((discount: any) => {
      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (total * Number(discount.value)) / 100;
      } else {
        discountAmount = Number(discount.value);
      }
      breakdown.discounts += discountAmount;
      total -= discountAmount;
    });

    breakdown.total = Math.max(0, total);
    return breakdown;
  };

  // Cost by period
  const calculateCostByPeriod = () => {
    const periods = { oneTime: 0, monthly: 0, quarterly: 0, yearly: 0 } as any;

    // Setup fees from products
    parsedProductConfigurations.forEach((config: any) => {
      const selectedProduct = products.find((p: any) => String(p.id) === String(config.productId));
      if (!selectedProduct) return;
      if (config.includeSetupCost && selectedProduct.setup_fee) {
        periods.oneTime += Number(selectedProduct.setup_fee) || 0;
      }
    });

    // One-time custom requirements
    parsedCustomRequirements.forEach((req: any) => {
      if (req.frequency === 'one-time' || !req.frequency) {
        periods.oneTime += parseFloat(req.price) || 0;
      }
    });

    // Recurring product plan prices and addons per frequency
    parsedProductConfigurations.forEach((config: any) => {
      const selectedProduct = products.find((p: any) => String(p.id) === String(config.productId));
      if (!selectedProduct) return;

      try {
        const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
        const selectedPlan = pricingPlans.find((plan: any) => String(plan.id) === String(config.planId));
        if (selectedPlan && selectedPlan.pricingOptions) {
          const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
          if (pricingOption) {
            const planPrice = parseFloat(pricingOption.price) || 0;
            // Product-level discount
            let discountAmount = 0;
            if (config.discountValue > 0) {
              discountAmount = config.discountType === 'percentage' ? (planPrice * Number(config.discountValue)) / 100 : Number(config.discountValue);
            }
            const finalPrice = planPrice - discountAmount;
            switch ((config.frequency || '').toLowerCase()) {
              case 'monthly':
                periods.monthly += finalPrice;
                break;
              case 'quarterly':
                periods.quarterly += finalPrice;
                break;
              case 'yearly':
                periods.yearly += finalPrice;
                break;
              default:
                periods.monthly += finalPrice;
            }
          }
        }
      } catch {}

      // Addons by frequency
      try {
        const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
        (config.selectedAddons || []).forEach((addonId: string) => {
          const addon = customElements.find((a: any) => String(a.id) === String(addonId));
          if (addon) {
            const addonCost = parseFloat(addon.additional_cost) || 0;
            switch ((config.frequency || '').toLowerCase()) {
              case 'monthly':
                periods.monthly += addonCost;
                break;
              case 'quarterly':
                periods.quarterly += addonCost;
                break;
              case 'yearly':
                periods.yearly += addonCost;
                break;
              default:
                periods.monthly += addonCost;
            }
          }
        });
      } catch {}
    });

    // Recurring custom requirements
    parsedCustomRequirements.forEach((req: any) => {
      if (req.frequency && req.frequency !== 'one-time') {
        const requirementCost = parseFloat(req.price) || 0;
        let discountAmount = 0;
        if (req.discountValue > 0) {
          discountAmount = req.discountType === 'percentage' ? (requirementCost * Number(req.discountValue)) / 100 : Number(req.discountValue);
        }
        const finalCost = requirementCost - discountAmount;
        switch ((req.frequency || '').toLowerCase()) {
          case 'monthly':
            periods.monthly += finalCost;
            break;
          case 'quarterly':
            periods.quarterly += finalCost;
            break;
          case 'yearly':
            periods.yearly += finalCost;
            break;
        }
      }
    });

    return periods;
  };

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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[95vh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Title, Status and Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">Quote Preview</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isDraft ? 'Draft' : 'Generated'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isGenerated && (
                  <button
                    onClick={downloadPDF}
                    className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    Download
                  </button>
                )}
                {isDraft && (
                  <button
                    onClick={handleGenerateQuote}
                    className="hidden sm:inline-flex bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
                  >
                    Generate Quote
                  </button>
                )}

                {isDraft && (
                  <button
                    onClick={handleEditQuote}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors duration-200"
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
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors duration-200"
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
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors duration-200"
                  title="Duplicate Quote"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {isDraft && (
                  <button
                    onClick={handleDeleteQuote}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors duration-200"
                    title="Delete Quote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div ref={quoteRef} className="bg-white border border-gray-200 rounded-lg p-6 max-w-[800px] mx-auto">
              {/* Header */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{config.company_name}</h1>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{config.company_email}</p>
                      <p>{config.phone}</p>
                      <p className="mt-1">{config.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-blue-600">QUOTE</h2>
                    {/* Debug: Always show quotation number field */}
                    <p className="text-gray-600 text-sm font-semibold">
                      Quotation #: {quote.quotation_num || 'Not assigned'}
                    </p>
                    <p className="text-gray-600 text-sm">Date: {formatDate(new Date())}</p>
                    <p className="text-gray-600 text-sm">Valid until: {formatDate(validUntil)}</p>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="mb-8">
                <div className="flex justify-between items-start">
                  {/* Left Side - Client Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">To:</h3>
                    <div className="space-y-0">
                      <p className="text-gray-700 font-medium">{quote.clientName}</p>
                      {quote.companyName && (
                        <p className="text-gray-600">{quote.companyName}</p>
                      )}
                      {quote.clientEmail && (
                        <p className="text-gray-600 text-sm">{quote.clientEmail}</p>
                      )}
                      {quote.phoneNumber && (
                        <p className="text-gray-600 text-sm">{quote.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side - Project Details */}
                  {(quote.quoteReference || quote.projectTimeline) && (
                    <div className="text-right">
                      {quote.quoteReference && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Project: </span>
                          <span className="text-sm text-gray-600">{quote.quoteReference}</span>
                        </div>
                      )}
                      {quote.projectTimeline && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Timeline: </span>
                          <span className="text-sm text-gray-600">{quote.projectTimeline}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Summary */}
              <div className="mb-8">
                <QuoteCostSummary
                  products={products}
                  productConfigurations={parsedProductConfigurations}
                  customRequirements={parsedCustomRequirements}
                  discounts={parsedDiscounts}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {config.terms_and_conditions || `This quote is valid for ${config.validity_days || 30} days from the date of issue. Payment is due within 30 days of invoice date.`}
                </div>
              </div>

              {/* Footer Message */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  {config.footer_message || 'Thank you for considering our services.'}
                </p>
              </div>
            </div>

            {/* Action Buttons moved to header (above) */}
          </div>
        </div>
      )}

      {/* Generate Quote Confirmation Modal */}
      {showGenerateConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowGenerateConfirmation(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
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