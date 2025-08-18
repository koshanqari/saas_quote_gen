'use client';

import { useState, useEffect } from 'react';
import QuotePreview from './QuotePreview';

interface QuoteHistoryProps {
  setShowQuoteForm: (show: boolean) => void;
  setSelectedQuote: (quote: any) => void;
}

export default function QuoteHistory({
  setShowQuoteForm,
  setSelectedQuote
}: QuoteHistoryProps) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quoteConfig, setQuoteConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  const fetchQuotes = async () => {
    setIsLoadingQuotes(true);
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      
      // Parse JSON strings back to objects
      const parsedQuotes = data.map((quote: any) => ({
        ...quote,
        customRequirements: quote.customRequirements ? JSON.parse(quote.customRequirements) : [],
        productConfigurations: quote.productConfigurations ? JSON.parse(quote.productConfigurations) : [],
        discounts: quote.discounts ? JSON.parse(quote.discounts) : []
      }));
      
      setQuotes(parsedQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const fetchQuoteConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setQuoteConfig(data);
    } catch (error) {
      console.error('Error fetching quote config:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Helper function to transform quote data for QuotePreview
  const transformQuoteData = (quote: any, products: any[]) => {
    const items: any[] = [];
    let total = 0;

    // Transform product configurations
    if (quote.productConfigurations && Array.isArray(quote.productConfigurations)) {
      quote.productConfigurations.forEach((config: any) => {
        const selectedProduct = products.find(p => p.id === config.productId);
        if (!selectedProduct) return;

        let planPrice = 0;
        let planName = '';

        try {
          const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
          const selectedPlan = pricingPlans.find((plan: any) => plan.id === config.planId);
          if (selectedPlan && selectedPlan.pricingOptions) {
            const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
            if (pricingOption) {
              planPrice = parseFloat(pricingOption.price) || 0;
              planName = selectedPlan.name;
            }
          }
        } catch (e) {
          console.error('Error parsing pricing plans:', e);
        }

        // Calculate addon costs
        let addonCost = 0;
        try {
          const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
          config.selectedAddons.forEach((addonId: string) => {
            const addon = customElements.find((a: any) => a.id === addonId);
            if (addon) {
              addonCost += parseFloat(addon.additional_cost) || 0;
            }
          });
        } catch (e) {
          console.error('Error parsing custom elements:', e);
        }

        // Calculate setup cost
        const setupCost = config.includeSetupCost ? (Number(selectedProduct.setup_fee) || 0) : 0;

        // Calculate discount
        let discountAmount = 0;
        if (config.discountValue > 0) {
          if (config.discountType === 'percentage') {
            discountAmount = (planPrice * Number(config.discountValue)) / 100;
          } else {
            discountAmount = Number(config.discountValue);
          }
        }

        const itemTotal = planPrice + addonCost + setupCost - discountAmount;
        total += itemTotal;

        items.push({
          productId: config.productId,
          productName: `${selectedProduct.name} - ${planName}`,
          quantity: 1,
          duration: config.frequency === 'monthly' ? 1 : config.frequency === 'quarterly' ? 3 : config.frequency === 'yearly' ? 12 : 1,
          price: planPrice,
          discount: config.discountValue || 0,
          total: itemTotal,
          addonCost,
          setupCost
        });
      });
    }

    // Transform custom requirements
    if (quote.customRequirements && Array.isArray(quote.customRequirements)) {
      quote.customRequirements.forEach((req: any) => {
        const reqCost = parseFloat(req.price) || 0;
        const reqDiscount = req.discountValue > 0 ?
          (req.discountType === 'percentage' ? (reqCost * Number(req.discountValue) / 100) : Number(req.discountValue)) : 0;
        
        const itemTotal = reqCost - reqDiscount;
        total += itemTotal;

        items.push({
          productId: `custom-${Date.now()}`,
          productName: req.name || 'Custom Requirement',
          quantity: 1,
          duration: req.frequency === 'monthly' ? 1 : req.frequency === 'quarterly' ? 3 : req.frequency === 'yearly' ? 12 : 1,
          price: reqCost,
          discount: req.discountValue || 0,
          total: itemTotal
        });
      });
    }

    return { items, total };
  };

  useEffect(() => {
    fetchQuotes();
    fetchQuoteConfig();
    fetchProducts();
  }, []);

  // Filtering state
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>(quotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('quoteReference');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createdByFilter, setCreatedByFilter] = useState('all');

  // Filtering functions
  const applyFilters = () => {
    let filtered = [...quotes];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(quote => {
        if (searchCategory === 'quoteReference') {
          return quote.quoteReference && quote.quoteReference.toLowerCase().includes(searchLower);
        } else if (searchCategory === 'clientName') {
          return quote.clientName && quote.clientName.toLowerCase().includes(searchLower);
        } else if (searchCategory === 'companyName') {
          return quote.companyName && quote.companyName.toLowerCase().includes(searchLower);
        } else if (searchCategory === 'phoneNumber') {
          return quote.phoneNumber && quote.phoneNumber.toLowerCase().includes(searchLower);
        } else if (searchCategory === 'clientEmail') {
          return quote.clientEmail && quote.clientEmail.toLowerCase().includes(searchLower);
        }
        return false;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    // Created By filter
    if (createdByFilter !== 'all') {
      filtered = filtered.filter(quote => quote.createdBy === createdByFilter);
    }

    // Sort by creation date (newer first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredQuotes(filtered);
  };

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, searchCategory, statusFilter, createdByFilter, quotes]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchCategory('quoteReference');
    setStatusFilter('all');
    setCreatedByFilter('all');
  };

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<any | null>(null);

  // Mark a draft quote as generated
  const handleGenerateQuoteFromPreview = async (quote: any) => {
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          quoteId: quote.id,
          quote: {
            ...quote,
            status: 'generated',
          }
        }),
      });
      if (response.ok) {
        setIsPreviewOpen(false);
        await fetchQuotes();
      } else {
        console.error('Failed to generate quote');
        alert('Failed to generate quote.');
      }
    } catch (e) {
      console.error('Error generating quote:', e);
      alert('Error generating quote.');
    }
  };

  // Quote action handlers
  const handleGenerateQuote = () => {
    setShowQuoteForm(true);
  };

  const handleDuplicateQuote = (quote: any) => {
    // Create a copy of the quote with modified reference and new timestamp
    const quoteCopy = {
      ...quote,
      quoteReference: `${quote.quoteReference} (Copy)`,
      id: undefined, // Remove the original ID for the copy
      createdAt: new Date().toISOString(), // Set new creation time
      quotation_num: undefined // Remove quotation number for the copy
    };
    
    // Set the quote data and show the form
    setSelectedQuote(quoteCopy);
    setShowQuoteForm(true);
  };

  const handleViewQuoteForm = (quote: any) => {
    // Set the quote data and show the form in view mode
    setSelectedQuote({ ...quote, isViewMode: true });
    setShowQuoteForm(true);
  };

  const handleEditQuote = (quote: any) => {
    // Set the quote data and show the form
    setSelectedQuote(quote);
    setShowQuoteForm(true);
  };

  // Date picker functions
  const handleDateRangeSelect = () => {
    setShowDatePicker(true);
  };

  const handleDateRangeConfirm = () => {
    setShowDatePicker(false);
  };

  const handleDateRangeCancel = () => {
    setShowDatePicker(false);
  };

  const formatDateRange = () => {
    if (dateRange.start && dateRange.end) {
      return `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`;
    } else if (dateRange.start) {
      return `From ${new Date(dateRange.start).toLocaleDateString()}`;
    } else if (dateRange.end) {
      return `Until ${new Date(dateRange.end).toLocaleDateString()}`;
    }
    return 'Select Date Range';
  };

  // Delete confirmation functions
  const handleDeleteQuote = (quote: any) => {
    setQuoteToDelete(quote);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteQuote = async () => {
    if (!quoteToDelete) return;

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          quoteId: quoteToDelete.id
        }),
      });

      if (response.ok) {
        // Close modals
        setShowDeleteConfirmation(false);
        setQuoteToDelete(null);
        // Refresh quotes list
        window.location.reload(); // Temporary solution
      } else {
        console.error('Failed to delete quote');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const cancelDeleteQuote = () => {
    setShowDeleteConfirmation(false);
    setQuoteToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Centralized Quote Preview modal (controlled) */}
      {previewQuote && (
        <QuotePreview
          quote={previewQuote}
          isOpenExternal={isPreviewOpen}
          onRequestClose={() => setIsPreviewOpen(false)}
          onEditQuote={(q) => {
            setIsPreviewOpen(false);
            handleEditQuote(q);
          }}
          onViewQuote={(q) => {
            setIsPreviewOpen(false);
            handleViewQuoteForm(q);
          }}
          onDuplicateQuote={(q) => {
            setIsPreviewOpen(false);
            handleDuplicateQuote(q);
          }}
          onDeleteQuote={(q) => {
            setIsPreviewOpen(false);
            handleDeleteQuote(q);
          }}
          onGenerateQuote={handleGenerateQuoteFromPreview}
        />
      )}
      {/* Header with Generate Quote Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quote History</h2>
          <p className="text-gray-600">View and manage all your generated quotes</p>
        </div>
        <button
          onClick={handleGenerateQuote}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Generate Quote</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search In
            </label>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="quoteReference">Quote Reference</option>
              <option value="clientName">Client Name</option>
              <option value="companyName">Company</option>
              <option value="phoneNumber">Phone</option>
              <option value="clientEmail">Email</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Term
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quotes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
            </select>
          </div>

          {/* Created By Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Created By
            </label>
            <select
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Range
            </label>
            <button
              onClick={handleDateRangeSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
            >
              <span className={dateRange.start || dateRange.end ? 'text-gray-900' : 'text-gray-500'}>
                {formatDateRange()}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || statusFilter !== 'all' || createdByFilter !== 'all' || dateRange.start || dateRange.end) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Quotes List */}
      {isLoadingQuotes ? (
        <div className="text-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading quotes...</p>
        </div>
      ) : filteredQuotes.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 w-8"></th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 w-1/5">Quote Reference</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 w-1/6">Client</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 w-1/6">Company</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 w-1/8">Created</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 w-1/8">Created By</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote, index) => {
                  const { items, total } = transformQuoteData(quote, products);
                  const normalizedStatus = String(quote.status || '').toLowerCase();
                  const quoteWithItems = { ...quote, items, total, status: normalizedStatus };

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setPreviewQuote(quoteWithItems);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${quote.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                            }`} title={quote.status === 'draft' ? 'Draft' : 'Generated'}>
                            {quote.status === 'draft' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {quote.quoteReference || 'Untitled Quote'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {quote.clientEmail}
                          </div>
                          {quote.quotation_num && (
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              #{quote.quotation_num}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {quote.clientName}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {quote.companyName || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          Guest
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {quote.status === 'draft' ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditQuote(quote);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 bg-blue-100 hover:bg-blue-200 text-blue-700"
                                title="Edit Quote"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateQuote(quote);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 bg-purple-100 hover:bg-purple-200 text-purple-700"
                                title="Duplicate Quote"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuote(quote);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 bg-red-100 hover:bg-red-200 text-red-700"
                                title="Delete Quote"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewQuoteForm(quote);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 bg-green-100 hover:bg-green-200 text-green-700"
                                title="View Quote"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateQuote(quote);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 bg-purple-100 hover:bg-purple-200 text-purple-700"
                                title="Duplicate Quote"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <svg className="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {quotes.length > 0 ? 'No quotes match your filters' : 'No quotes yet'}
          </h3>
          <p className="text-gray-600 text-lg">
            {quotes.length > 0 ? 'Try adjusting your search criteria or clear filters' : 'Generate your first quote to get started'}
          </p>
          {quotes.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Select Date Range</h3>
              <button
                onClick={handleDateRangeCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleDateRangeCancel}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDateRangeConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quote Confirmation Modal */}
      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={cancelDeleteQuote}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Quote</h2>
                <p className="text-gray-600">
                  Are you sure you want to delete "{quoteToDelete?.quoteReference || 'this quote'}"?
                  This action cannot be undone.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4">
                <button
                  onClick={cancelDeleteQuote}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteQuote}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Delete Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 