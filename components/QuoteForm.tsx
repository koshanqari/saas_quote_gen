'use client';

import { useState } from 'react';
import { Product } from '@/lib/csv-utils';
import QuoteCostSummary from './QuoteCostSummary';

interface QuoteFormProps {
  products: Product[];
  onCancel: () => void;
  initialData?: any; // For editing existing quotes
}


export default function QuoteForm({ products, onCancel, initialData }: QuoteFormProps) {
    // Check if we're in view mode
    const isViewMode = initialData?.isViewMode || false;
    
    // Debug: Log products
    console.log('QuoteForm products:', products?.length || 0);
    
    // Custom Requirements state
    const [customRequirements, setCustomRequirements] = useState<Array<{
      name: string,
      description: string,
      price: string,
      frequency: string,
      discountType: string,
      discountFreq: string,
      discountValue: number
    }>>(initialData?.customRequirements || []);
  
    // Product Configurations state
    const [productConfigurations, setProductConfigurations] = useState<Array<{
      productId: string,
      frequency: string,
      planId: string,
      selectedAddons: string[],
      discountType: string,
      discountFreq: string,
      discountValue: number,
      includeSetupCost: boolean
    }>>(initialData?.productConfigurations || []);
  
    // Discounts state
    const [discounts, setDiscounts] = useState<Array<{ type: string, value: number, description: string, discountFreq: string }>>(initialData?.discounts || []);
  
    // Quote generation confirmation state
    const [showGenerateConfirmation, setShowGenerateConfirmation] = useState(false);
  
    const [clientInfo, setClientInfo] = useState({
      clientName: initialData?.clientName || '',
      clientEmail: initialData?.clientEmail || '',
      companyName: initialData?.companyName || '',
      phoneNumber: initialData?.phoneNumber || '',
      quoteReference: initialData?.quoteReference || '',
      projectTimeline: initialData?.projectTimeline || '',
      additionalNotes: initialData?.additionalNotes || ''
    });

    const handleInputChange = (field: string, value: string) => {
        setClientInfo(prev => ({
          ...prev,
          [field]: value
        }));
      };
    
      // Custom Requirements functions
      const addCustomRequirement = () => {
        setCustomRequirements([...customRequirements, {
          name: '',
          description: '',
          price: '',
          frequency: 'One-time',
          discountType: 'percentage',
          discountFreq: '',
          discountValue: 0
        }]);
      };
    
      const removeCustomRequirement = (index: number) => {
        const updatedRequirements = customRequirements.filter((_, i) => i !== index);
        setCustomRequirements(updatedRequirements);
      };
    
      const updateCustomRequirement = (index: number, field: 'name' | 'description' | 'price' | 'frequency' | 'discountType' | 'discountFreq' | 'discountValue', value: string | number) => {
        const updatedRequirements = [...customRequirements];
        updatedRequirements[index] = { ...updatedRequirements[index], [field]: value };
        setCustomRequirements(updatedRequirements);
      };
    
      const addProductConfiguration = () => {
        setProductConfigurations(prev => [...prev, {
          productId: '',
          frequency: '',
          planId: '',
          selectedAddons: [],
          discountType: 'percentage',
          discountFreq: '',
          discountValue: 0,
          includeSetupCost: false
        }]);
      };
    
      const removeProductConfiguration = (index: number) => {
        setProductConfigurations(prev => prev.filter((_, i) => i !== index));
      };
    
      const updateProductConfiguration = (index: number, field: 'productId' | 'frequency' | 'planId' | 'discountType' | 'discountFreq' | 'discountValue' | 'includeSetupCost', value: string | number | boolean) => {
        setProductConfigurations(prev =>
          prev.map((config, i) =>
            i === index ? { ...config, [field]: value } : config
          )
        );
      };
    
      const updateProductAddons = (index: number, addonId: string, isSelected: boolean) => {
        setProductConfigurations(prev =>
          prev.map((config, i) =>
            i === index ? {
              ...config,
              selectedAddons: isSelected
                ? [...config.selectedAddons, addonId]
                : config.selectedAddons.filter(id => id !== addonId)
            } : config
          )
        );
      };
    
      const addDiscount = () => {
        setDiscounts(prev => [...prev, {
          type: 'percentage',
          value: 0,
          description: '',
          discountFreq: ''
        }]);
      };
    
      const removeDiscount = (index: number) => {
        setDiscounts(prev => prev.filter((_, i) => i !== index));
      };
    
      const updateDiscount = (index: number, field: 'type' | 'value' | 'description' | 'discountFreq', value: string | number) => {
        setDiscounts(prev =>
          prev.map((discount, i) =>
            i === index ? { ...discount, [field]: value } : discount
          )
        );
      };
    
      // Form action handlers
      const handleCancel = () => {
        onCancel();
      };
    
      const handleSaveDraft = async () => {
        try {
          const draftData = {
            ...clientInfo,
            customRequirements,
            productConfigurations,
            discounts,
            status: 'draft',
            createdAt: initialData?.id ? initialData.createdAt : new Date().toISOString()
          };

          const response = await fetch('/api/quotes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: initialData?.id ? 'update' : 'add',
              quoteId: initialData?.id,
              quote: draftData
            }),
          });

          if (response.ok) {
            onCancel(); // Close the form
            alert(initialData?.id ? 'Quote updated successfully!' : 'Draft saved successfully!');
            // Note: We'll need to trigger a refresh of quotes from parent
            window.location.reload(); // Simple solution for now
          } else {
            alert('Error saving draft. Please try again.');
          }
        } catch (error) {
          console.error('Error saving draft:', error);
          alert('Error saving draft. Please try again.');
        }
      };
    
      const handleGenerateQuoteClick = () => {
        setShowGenerateConfirmation(true);
      };
    
      const handleConfirmGenerateQuote = async () => {
        setShowGenerateConfirmation(false);
        try {
          const quoteData = {
            ...clientInfo,
            customRequirements,
            productConfigurations,
            discounts,
            createdAt: initialData?.id ? initialData.createdAt : new Date().toISOString(),
            status: 'generated' // Changed from 'draft' to 'generated' to trigger quotation number generation
          };

          const response = await fetch('/api/quotes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: initialData?.id ? 'update' : 'add',
              quoteId: initialData?.id,
              quote: quoteData
            }),
          });

          if (response.ok) {
            onCancel(); // Close the form
            alert(initialData?.id ? 'Quote updated successfully!' : 'Quote generated successfully!');
            // Note: We'll need to trigger a refresh of quotes from parent
            window.location.reload(); // Simple solution for now
          } else {
            console.error('Failed to create quote');
            alert('Error generating quote. Please try again.');
          }
        } catch (error) {
          console.error('Error creating quote:', error);
          alert('Error generating quote. Please try again.');
        }
      };
    
      const handleCancelGenerateQuote = () => {
        setShowGenerateConfirmation(false);
      };


  // Calculate total cost for quote summary
  const calculateTotalCost = () => {
    let total = 0;
    const breakdown = {
      products: 0,
      setupCosts: 0,
      addons: 0,
      customRequirements: 0,
      discounts: 0,
      total: 0
    };

    // Calculate product costs
    productConfigurations.forEach(config => {
      const selectedProduct = products.find(p => p.id === config.productId);
      if (!selectedProduct) return;

      // Get plan price
      try {
        const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
        const selectedPlan = pricingPlans.find((plan: any) => plan.id === config.planId);
        if (selectedPlan && selectedPlan.pricingOptions) {
          const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
          if (pricingOption) {
            const planPrice = parseFloat(pricingOption.price) || 0;
            breakdown.products += planPrice;
            total += planPrice;
          }
        }
      } catch (e) {
        console.error('Error parsing pricing plans:', e);
      }

      // Add setup cost if selected
      if (config.includeSetupCost && selectedProduct.setup_fee) {
        const setupCost = Number(selectedProduct.setup_fee) || 0;
        breakdown.setupCosts += setupCost;
        total += setupCost;
      }

      // Add addon costs
      try {
        const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
        config.selectedAddons.forEach(addonId => {
          const addon = customElements.find((a: any) => a.id === addonId);
          if (addon) {
            const addonCost = parseFloat(addon.additional_cost) || 0;
            breakdown.addons += addonCost;
            total += addonCost;
          }
        });
      } catch (e) {
        console.error('Error parsing custom elements:', e);
      }

      // Apply product-level discounts
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

    // Add custom requirements
    customRequirements.forEach(req => {
      const requirementCost = parseFloat(req.price) || 0;
      breakdown.customRequirements += requirementCost;
      total += requirementCost;
    });

    // Apply global discounts
    discounts.forEach(discount => {
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

  const calculateCostByPeriod = () => {
    const periods = {
      oneTime: 0,
      monthly: 0,
      quarterly: 0,
      yearly: 0
    };

    // Calculate one-time costs (setup fees, one-time custom requirements)
    productConfigurations.forEach(config => {
      const selectedProduct = products.find(p => p.id === config.productId);
      if (!selectedProduct) return;

      // Add setup cost if selected
      if (config.includeSetupCost && selectedProduct.setup_fee) {
        periods.oneTime += Number(selectedProduct.setup_fee) || 0;
      }
    });

    // Add one-time custom requirements
    customRequirements.forEach(req => {
      if (req.frequency === 'one-time' || !req.frequency) {
        periods.oneTime += parseFloat(req.price) || 0;
      }
    });

    // Calculate recurring costs by frequency
    productConfigurations.forEach(config => {
      const selectedProduct = products.find(p => p.id === config.productId);
      if (!selectedProduct) return;

      try {
        const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
        const selectedPlan = pricingPlans.find((plan: any) => plan.id === config.planId);
        if (selectedPlan && selectedPlan.pricingOptions) {
          const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
          if (pricingOption) {
            const planPrice = parseFloat(pricingOption.price) || 0;
            
            // Calculate discount for this product
            let discountAmount = 0;
            if (config.discountValue > 0) {
              if (config.discountType === 'percentage') {
                discountAmount = (planPrice * Number(config.discountValue)) / 100;
              } else {
                discountAmount = Number(config.discountValue);
              }
            }
            
            const finalPrice = planPrice - discountAmount;
            
            switch (config.frequency.toLowerCase()) {
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
                periods.monthly += finalPrice; // Default to monthly
            }
          }
        }
      } catch (e) {
        console.error('Error parsing pricing plans:', e);
      }

      // Add addon costs based on frequency
      try {
        const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
        config.selectedAddons.forEach(addonId => {
          const addon = customElements.find((a: any) => a.id === addonId);
          if (addon) {
            const addonCost = parseFloat(addon.additional_cost) || 0;
            
            switch (config.frequency.toLowerCase()) {
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
                periods.monthly += addonCost; // Default to monthly
            }
          }
        });
      } catch (e) {
        console.error('Error parsing custom elements:', e);
      }
    });

    // Add recurring custom requirements
    customRequirements.forEach(req => {
      if (req.frequency && req.frequency !== 'one-time') {
        const requirementCost = parseFloat(req.price) || 0;
        
        // Calculate discount for custom requirements
        let discountAmount = 0;
        if (req.discountValue > 0) {
          if (req.discountType === 'percentage') {
            discountAmount = (requirementCost * Number(req.discountValue)) / 100;
          } else {
            discountAmount = Number(req.discountValue);
          }
        }
        
        const finalCost = requirementCost - discountAmount;
        
        switch (req.frequency.toLowerCase()) {
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
      <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isViewMode ? 'View Quote' : 'Generate New Quote'}
            </h2>
            <p className="text-gray-600">
              {isViewMode ? 'View the quote details below' : 'Complete all sections to create a comprehensive quote'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleGenerateQuoteClick(); }} className="space-y-8">
          {/* Client Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Client Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name *</label>
                <input
                  type="text"
                  value={clientInfo.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="Enter client's full name"
                  required
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client Email *</label>
                <input
                  type="email"
                  value={clientInfo.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="client@company.com"
                  required
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={clientInfo.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="Enter company name"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={clientInfo.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="+1 (555) 123-4567"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quote Reference / Project</label>
                <input
                  type="text"
                  value={clientInfo.quoteReference}
                  onChange={(e) => handleInputChange('quoteReference', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="e.g., Website Redesign, Mobile App"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Timeline</label>
                <input
                  type="text"
                  value={clientInfo.projectTimeline}
                  onChange={(e) => handleInputChange('projectTimeline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="e.g., 3 months, Q2 2024"
                  disabled={isViewMode}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes or Requirements (for personal use only)</label>
              <textarea
                value={clientInfo.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                rows={4}
                placeholder="Describe any specific requirements, constraints, or additional information for this project..."
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Product Configuration Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Product Configuration
              </h4>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={addProductConfiguration}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Product Configurations List */}
              {productConfigurations.map((config, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-lg font-semibold text-gray-900">Product Configuration #{index + 1}</h5>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => removeProductConfiguration(index)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Product Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Product *
                      </label>
                      <select
                        value={config.productId}
                        onChange={(e) => updateProductConfiguration(index, 'productId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                        disabled={isViewMode}
                      >
                        <option value="">Select a product...</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plan and Frequency Selection */}
                    {config.productId && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Plan *
                          </label>
                          <select
                            value={config.planId}
                            onChange={(e) => {
                              updateProductConfiguration(index, 'planId', e.target.value);
                              // Reset frequency when plan changes
                              updateProductConfiguration(index, 'frequency', '');
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            required
                            disabled={isViewMode}
                          >
                            <option value="">Select a plan...</option>
                            {(() => {
                              const selectedProduct = products.find(p => p.id === config.productId);
                              if (!selectedProduct) return null;

                              try {
                                const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
                                return pricingPlans.map((plan: any) => (
                                  <option key={plan.id} value={plan.id}>
                                    {plan.name}
                                  </option>
                                ));
                              } catch (e) {
                                return null;
                              }
                            })()}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Frequency *
                          </label>
                          <select
                            value={config.frequency}
                            onChange={(e) => updateProductConfiguration(index, 'frequency', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            required
                            disabled={!config.planId || isViewMode}
                          >
                            <option value="">Select frequency...</option>
                            {(() => {
                              const selectedProduct = products.find(p => p.id === config.productId);
                              if (!selectedProduct || !config.planId) return null;

                              try {
                                const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
                                const selectedPlan = pricingPlans.find((plan: any) => plan.id === config.planId);

                                if (!selectedPlan || !selectedPlan.pricingOptions) return null;

                                return selectedPlan.pricingOptions.map((option: any) => (
                                  <option key={option.frequency} value={option.frequency}>
                                    {option.frequency} - ₹{option.price}
                                  </option>
                                ));
                              } catch (e) {
                                return null;
                              }
                            })()}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Setup Cost */}
                    {config.productId && (
                      <div>
                        <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.includeSetupCost}
                            onChange={(e) => updateProductConfiguration(index, 'includeSetupCost', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Include Setup Cost</div>
                            <div className="text-sm text-gray-600">
                              {(() => {
                                const selectedProduct = products.find(p => p.id === config.productId);
                                if (!selectedProduct || !selectedProduct.setup_fee) return 'No setup cost available';
                                return `Setup Cost: ₹${selectedProduct.setup_fee}`;
                              })()}
                            </div>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Available Add-ons */}
                    {config.productId && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Available Add-ons
                        </label>
                        <div className="space-y-3">
                          {(() => {
                            const selectedProduct = products.find(p => p.id === config.productId);
                            if (!selectedProduct) return null;

                            try {
                              const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
                              return customElements
                                .map((addon: any) => (
                                  <label key={addon.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={config.selectedAddons.includes(addon.id)}
                                      onChange={(e) => updateProductAddons(index, addon.id, e.target.checked)}
                                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{addon.name}</div>
                                      <div className="text-sm text-gray-600">{addon.description}</div>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <div className="text-sm text-green-600 font-medium">
                                          +₹{addon.additional_cost}
                                        </div>
                                        <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                          {addon.frequency}
                                        </div>
                                        <div className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                          {addon.type}
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                ));
                            } catch (e) {
                              return <p className="text-gray-500 text-sm">No add-ons available for this frequency</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Type
                        </label>
                        <select
                          value={config.discountType}
                          onChange={(e) => updateProductConfiguration(index, 'discountType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Freq
                        </label>
                        <select
                          value={config.discountFreq || ''}
                          onChange={(e) => updateProductConfiguration(index, 'discountFreq', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        >
                          <option value="">N/A</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                          <option value="One-time">One-time</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Value
                        </label>
                        <input
                          type="number"
                          value={config.discountValue === 0 ? '' : config.discountValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateProductConfiguration(index, 'discountValue', value === '' ? 0 : parseFloat(value) || 0);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder={config.discountType === 'percentage' ? '0' : '0.00'}
                          min="0"
                          max={config.discountType === 'percentage' ? '100' : undefined}
                          step={config.discountType === 'percentage' ? '0.01' : '0.01'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {productConfigurations.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                    <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">No Products Added</h5>
                    <p className="text-gray-600">Click "Add Product" to start configuring products for this quote</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Requirements Section */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Custom Requirements
              </h4>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={addCustomRequirement}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Requirement
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Custom Requirements List */}
              {customRequirements.map((requirement, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-teal-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-lg font-semibold text-gray-900">Custom Requirement #{index + 1}</h5>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => removeCustomRequirement(index)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={requirement.name}
                        onChange={(e) => updateCustomRequirement(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        placeholder="Enter requirement name..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Requirement Description *
                      </label>
                      <textarea
                        value={requirement.description}
                        onChange={(e) => updateCustomRequirement(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        rows={3}
                        placeholder="Describe the custom requirement in detail..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            value={requirement.price}
                            onChange={(e) => updateCustomRequirement(index, 'price', e.target.value)}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Frequency
                        </label>
                        <select
                          value={requirement.frequency}
                          onChange={(e) => updateCustomRequirement(index, 'frequency', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        >
                          <option value="One-time">One-time</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Type
                        </label>
                        <select
                          value={requirement.discountType}
                          onChange={(e) => updateCustomRequirement(index, 'discountType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Freq
                        </label>
                        <select
                          value={requirement.discountFreq || ''}
                          onChange={(e) => updateCustomRequirement(index, 'discountFreq', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        >
                          <option value="">N/A</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                          <option value="One-time">One-time</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Value
                        </label>
                        <input
                          type="number"
                          value={requirement.discountValue === 0 ? '' : requirement.discountValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateCustomRequirement(index, 'discountValue', value === '' ? 0 : parseFloat(value) || 0);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          placeholder={requirement.discountType === 'percentage' ? '0' : '0.00'}
                          min="0"
                          max={requirement.discountType === 'percentage' ? '100' : undefined}
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {customRequirements.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-white rounded-xl p-6 border border-teal-200 shadow-sm">
                    <svg className="w-16 h-16 text-teal-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">No Custom Requirements</h5>
                    <p className="text-gray-600">Click the button above to add custom requirements</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Discount & Adjustments Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Discount & Adjustments
              </h4>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={addDiscount}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Discount
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Discounts List */}
              {discounts.map((discount, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-lg font-semibold text-gray-900">Discount #{index + 1}</h5>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => removeDiscount(index)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={discount.description}
                        onChange={(e) => updateDiscount(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        placeholder="Describe the discount or adjustment..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Type *
                        </label>
                        <select
                          value={discount.type}
                          onChange={(e) => updateDiscount(index, 'type', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Freq
                        </label>
                        <select
                          value={discount.discountFreq || ''}
                          onChange={(e) => updateDiscount(index, 'discountFreq', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        >
                          <option value="">N/A</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                          <option value="One-time">One-time</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Value *
                        </label>
                        <input
                          type="number"
                          value={discount.value === 0 ? '' : discount.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateDiscount(index, 'value', value === '' ? 0 : parseFloat(value) || 0);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                          placeholder={discount.type === 'percentage' ? '0' : '0.00'}
                          min="0"
                          step={discount.type === 'percentage' ? '0.01' : '0.01'}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {discounts.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
                    <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">No Discounts Added</h5>
                    <p className="text-gray-600">Click "Add Discount" to apply discounts or adjustments to this quote</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quote Summary Section */}
          <QuoteCostSummary
            products={products}
            productConfigurations={productConfigurations}
            customRequirements={customRequirements}
            discounts={discounts}
          />

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-xl transition-all duration-200"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>

            {!isViewMode && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleGenerateQuoteClick}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Generate Quote
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>

    {/* Generate Quote Confirmation Modal */}
    {showGenerateConfirmation && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={handleCancelGenerateQuote}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Quote Generation</h2>
              <p className="text-gray-600">Are you sure? Once the quote is generated, it can only be duplicated and not edited.</p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleCancelGenerateQuote}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGenerateQuote}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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