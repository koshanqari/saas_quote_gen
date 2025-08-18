'use client';

import React from 'react';

interface QuoteCostSummaryProps {
  products: any[];
  productConfigurations: Array<{
    productId: string;
    frequency: string;
    planId: string;
    selectedAddons?: string[];
    discountType?: string;
    discountFreq?: string;
    discountValue?: number;
    includeSetupCost?: boolean;
  }>;
  customRequirements: Array<{
    name: string;
    description: string;
    price: string | number;
    frequency?: string;
    discountType?: string;
    discountFreq?: string;
    discountValue?: number;
  }>;
  discounts: Array<{
    type: string; // 'percentage' | 'fixed'
    value: number;
    description?: string;
    discountFreq?: string;
  }>;
}

export default function QuoteCostSummary({
  products,
  productConfigurations,
  customRequirements,
  discounts,
}: QuoteCostSummaryProps) {
  // Helper: calculate totals similarly to QuoteForm
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

    productConfigurations.forEach((config) => {
      const selectedProduct = products.find((p) => String(p.id) === String(config.productId));
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

      // Setup
      if (config.includeSetupCost && selectedProduct.setup_fee) {
        const setupCost = Number(selectedProduct.setup_fee) || 0;
        breakdown.setupCosts += setupCost;
        total += setupCost;
      }

      // Addons
      try {
        const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
        (config.selectedAddons || []).forEach((addonId) => {
          const addon = customElements.find((a: any) => String(a.id) === String(addonId));
          if (addon) {
            const addonCost = parseFloat(addon.additional_cost) || 0;
            breakdown.addons += addonCost;
            total += addonCost;
          }
        });
      } catch {}

      // Product-level discount - apply to the specific product price, not total
      if ((config.discountValue || 0) > 0) {
        let discountAmount = 0;
        if (config.discountType === 'percentage') {
          // Find the plan price for this specific product
          try {
            const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
            const selectedPlan = pricingPlans.find((plan: any) => String(plan.id) === String(config.planId));
            if (selectedPlan && selectedPlan.pricingOptions) {
              const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
              if (pricingOption) {
                const planPrice = parseFloat(pricingOption.price) || 0;
                discountAmount = (planPrice * Number(config.discountValue)) / 100;
              }
            }
          } catch {}
        } else {
          discountAmount = Number(config.discountValue);
        }
        breakdown.discounts += discountAmount;
        total -= discountAmount;
      }
    });

    // Custom requirements
    customRequirements.forEach((req) => {
      const requirementCost = parseFloat(String(req.price)) || 0;
      breakdown.customRequirements += requirementCost;
      total += requirementCost;
      
      // Apply custom requirement discount
      if ((req.discountValue || 0) > 0) {
        let discountAmount = 0;
        if (req.discountType === 'percentage') {
          discountAmount = (requirementCost * Number(req.discountValue)) / 100;
        } else {
          discountAmount = Number(req.discountValue);
        }
        breakdown.discounts += discountAmount;
        total -= discountAmount;
      }
    });

    // Overall discounts
    discounts.forEach((discount) => {
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
    const periods: any = { oneTime: 0, monthly: 0, quarterly: 0, yearly: 0 };

    // Setup fees (always one-time)
    productConfigurations.forEach((config) => {
      const selectedProduct = products.find((p) => String(p.id) === String(config.productId));
      if (!selectedProduct) return;
      if (config.includeSetupCost && selectedProduct.setup_fee) {
        periods.oneTime += Number(selectedProduct.setup_fee) || 0;
      }
    });

    // One-time custom requirements
    customRequirements.forEach((req) => {
      if (req.frequency === 'one-time' || !req.frequency || req.frequency.toLowerCase() === 'one-time') {
        periods.oneTime += parseFloat(String(req.price)) || 0;
      }
    });

    // Recurring product prices & addons by frequency
    productConfigurations.forEach((config) => {
      const selectedProduct = products.find((p) => String(p.id) === String(config.productId));
      if (!selectedProduct) return;

      try {
        const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
        const selectedPlan = pricingPlans.find((plan: any) => String(plan.id) === String(config.planId));
        if (selectedPlan && selectedPlan.pricingOptions) {
          const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
          if (pricingOption) {
            const planPrice = parseFloat(pricingOption.price) || 0;
            
            // Apply product-level discount based on its frequency
            let discountAmount = 0;
            if ((config.discountValue || 0) > 0) {
              discountAmount = config.discountType === 'percentage' ? (planPrice * Number(config.discountValue)) / 100 : Number(config.discountValue);
            }
            const finalPrice = planPrice - discountAmount;
            
            // Add to appropriate frequency period
            const frequency = (config.frequency || '').toLowerCase();
            switch (frequency) {
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

      // Addons by their own frequency (not product frequency)
      try {
        const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
        (config.selectedAddons || []).forEach((addonId) => {
          const addon = customElements.find((a: any) => String(a.id) === String(addonId));
          if (addon) {
            const addonCost = parseFloat(addon.additional_cost) || 0;
            // Use addon's frequency, fallback to product frequency
            const addonFrequency = (addon.frequency || config.frequency || '').toLowerCase();
            switch (addonFrequency) {
              case 'monthly':
                periods.monthly += addonCost;
                break;
              case 'quarterly':
                periods.quarterly += addonCost;
                break;
              case 'yearly':
                periods.yearly += addonCost;
                break;
              case 'one-time':
                periods.oneTime += addonCost;
                break;
              default:
                // If no frequency specified, use product frequency
                const productFreq = (config.frequency || '').toLowerCase();
                switch (productFreq) {
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
          }
        });
      } catch {}
    });

    // Recurring custom requirements by frequency
    customRequirements.forEach((req) => {
      if (req.frequency && req.frequency !== 'one-time' && req.frequency.toLowerCase() !== 'one-time') {
        const requirementCost = parseFloat(String(req.price)) || 0;
        let discountAmount = 0;
        if ((req.discountValue || 0) > 0) {
          discountAmount = req.discountType === 'percentage' ? (requirementCost * Number(req.discountValue)) / 100 : Number(req.discountValue);
        }
        const finalCost = requirementCost - discountAmount;
        const frequency = (req.frequency || '').toLowerCase();
        switch (frequency) {
          case 'monthly':
            periods.monthly += finalCost;
            break;
          case 'quarterly':
            periods.quarterly += finalCost;
            break;
          case 'yearly':
            periods.yearly += finalCost;
            break;
          default:
            periods.monthly += finalCost;
        }
      }
    });

    // Apply overall discounts by frequency
    discounts.forEach((discount) => {
      const discountFreq = (discount.discountFreq || '').toLowerCase();
      let discountAmount = 0;
      
      if (discount.type === 'percentage') {
        // For percentage discounts, calculate based on the total of the specific frequency
        switch (discountFreq) {
          case 'monthly':
            discountAmount = (periods.monthly * Number(discount.value)) / 100;
            periods.monthly -= discountAmount;
            break;
          case 'quarterly':
            discountAmount = (periods.quarterly * Number(discount.value)) / 100;
            periods.quarterly -= discountAmount;
            break;
          case 'yearly':
            discountAmount = (periods.yearly * Number(discount.value)) / 100;
            periods.yearly -= discountAmount;
            break;
          case 'one-time':
            discountAmount = (periods.oneTime * Number(discount.value)) / 100;
            periods.oneTime -= discountAmount;
            break;
          default:
            // If no frequency specified, apply to all periods proportionally
            const totalRecurring = periods.monthly + periods.quarterly + periods.yearly;
            if (totalRecurring > 0) {
              const totalDiscount = (totalRecurring * Number(discount.value)) / 100;
              const monthlyRatio = periods.monthly / totalRecurring;
              const quarterlyRatio = periods.quarterly / totalRecurring;
              const yearlyRatio = periods.yearly / totalRecurring;
              
              periods.monthly -= totalDiscount * monthlyRatio;
              periods.quarterly -= totalDiscount * quarterlyRatio;
              periods.yearly -= totalDiscount * yearlyRatio;
            }
        }
      } else {
        // For fixed amount discounts, apply based on frequency
        discountAmount = Number(discount.value);
        switch (discountFreq) {
          case 'monthly':
            periods.monthly -= discountAmount;
            break;
          case 'quarterly':
            periods.quarterly -= discountAmount;
            break;
          case 'yearly':
            periods.yearly -= discountAmount;
            break;
          case 'one-time':
            periods.oneTime -= discountAmount;
            break;
          default:
            // If no frequency specified, apply to one-time only
            periods.oneTime -= discountAmount;
        }
      }
      
      // Ensure no negative values
      periods.oneTime = Math.max(0, periods.oneTime);
      periods.monthly = Math.max(0, periods.monthly);
      periods.quarterly = Math.max(0, periods.quarterly);
      periods.yearly = Math.max(0, periods.yearly);
    });

    return periods;
  };

  const costByPeriod = calculateCostByPeriod();

  return (
    <div className="space-y-6">
      {/* Summary table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Product/Service</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description/Key Features</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Frequency</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Cost</th>
            </tr>
          </thead>
          <tbody>
            {/* Product Configuration */}
            {productConfigurations.length > 0 && (
              <>
                <tr className="bg-blue-50 border-b-2 border-blue-200">
                  <td colSpan={4} className="py-3 px-4 font-bold text-blue-900">Product Configuration</td>
                </tr>
                {productConfigurations.map((config, index) => {
                  const selectedProduct = products.find((p) => String(p.id) === String(config.productId));
                  if (!selectedProduct) return null;

                  let planPrice = 0;
                  let planName = '';
                  let frequency = '';
                  try {
                    const pricingPlans = JSON.parse(selectedProduct.pricing_plans || '[]');
                    const selectedPlan = pricingPlans.find((plan: any) => String(plan.id) === String(config.planId));
                    if (selectedPlan && selectedPlan.pricingOptions) {
                      const pricingOption = selectedPlan.pricingOptions.find((option: any) => option.frequency === config.frequency);
                      if (pricingOption) {
                        planPrice = parseFloat(pricingOption.price) || 0;
                        planName = selectedPlan.name;
                        frequency = config.frequency;
                      }
                    }
                  } catch {}

                  const setupCost = config.includeSetupCost ? (Number(selectedProduct.setup_fee) || 0) : 0;
                  const productDiscount = (config.discountValue || 0) > 0
                    ? (config.discountType === 'percentage' ? (planPrice * Number(config.discountValue) / 100) : Number(config.discountValue))
                    : 0;

                  return (
                    <>
                      <tr key={`product-${index}`} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{selectedProduct.name} - {planName}</td>
                        <td className="py-3 px-4 text-gray-700">{selectedProduct.key_features || 'Key Features'}</td>
                        <td className="py-3 px-4 text-gray-700">{frequency}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">₹{planPrice.toLocaleString()}</td>
                      </tr>
                      {setupCost > 0 && (
                        <tr key={`setup-${index}`} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">Setup Cost</td>
                          <td className="py-3 px-4 text-gray-700">One-time setup</td>
                          <td className="py-3 px-4 text-gray-700">One-time</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">₹{setupCost.toLocaleString()}</td>
                        </tr>
                      )}
                      {(() => {
                        let addonDetails: Array<{ name: string; cost: number; frequency: string; type: string }> = [];
                        try {
                          const customElements = JSON.parse(selectedProduct.custom_elements || '[]');
                          (config.selectedAddons || []).forEach((addonId) => {
                            const addon = customElements.find((a: any) => String(a.id) === String(addonId));
                            if (addon) {
                              const addonCost = parseFloat(addon.additional_cost) || 0;
                              addonDetails.push({ name: addon.name, cost: addonCost, frequency: addon.frequency, type: addon.type });
                            }
                          });
                        } catch {}
                        return addonDetails.map((addon, addonIndex) => (
                          <tr key={`addon-${index}-${addonIndex}`} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-medium text-gray-900">{addon.name}</td>
                            <td className="py-3 px-4 text-gray-700">{addon.type}</td>
                            <td className="py-3 px-4 text-gray-700">{addon.frequency}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">₹{addon.cost.toLocaleString()}</td>
                          </tr>
                        ));
                      })()}
                      {productDiscount > 0 && (
                        <tr key={`product-discount-${index}`} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-red-600 font-medium">Discount</td>
                          <td className="py-3 px-4 text-gray-500"></td>
                          <td className="py-3 px-4 text-gray-700">{config.discountFreq || frequency}</td>
                          <td className="py-3 px-4 text-right text-red-600 font-medium">-₹{productDiscount.toLocaleString()}</td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </>
            )}

            {/* Custom Requirements */}
            {customRequirements.length > 0 && (
              <>
                <tr className="bg-green-50 border-b-2 border-green-200">
                  <td colSpan={4} className="py-3 px-4 font-bold text-green-900">Custom Requirements</td>
                </tr>
                {customRequirements.map((req, index) => {
                  const reqCost = parseFloat(String(req.price)) || 0;
                  const reqDiscount = (req.discountValue || 0) > 0
                    ? (req.discountType === 'percentage' ? (reqCost * Number(req.discountValue) / 100) : Number(req.discountValue))
                    : 0;
                  return (
                    <>
                      <tr key={`req-${index}`} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{req.name || 'Custom Requirement'}</td>
                        <td className="py-3 px-4 text-gray-700">{req.description}</td>
                        <td className="py-3 px-4 text-gray-700">{req.frequency || 'One-time'}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">₹{reqCost.toLocaleString()}</td>
                      </tr>
                      {reqDiscount > 0 && (
                        <tr key={`req-disc-${index}`} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-red-600 font-medium">Discount</td>
                          <td className="py-3 px-4 text-gray-500"></td>
                          <td className="py-3 px-4 text-gray-700">{req.discountFreq || req.frequency || 'One-time'}</td>
                          <td className="py-3 px-4 text-right text-red-600 font-medium">-₹{reqDiscount.toLocaleString()}</td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </>
            )}

            {/* Overall Discounts */}
            {discounts.length > 0 && (
              <>
                <tr className="bg-purple-50 border-b-2 border-purple-200">
                  <td colSpan={4} className="py-3 px-4 font-bold text-purple-900">Overall Discounts</td>
                </tr>
                {discounts.map((discount, index) => {
                  const total = calculateTotalCost().total;
                  const discountAmount = discount.type === 'percentage' ? (total * Number(discount.value) / 100) : Number(discount.value);
                  return (
                    <tr key={`overall-discount-${index}`} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-red-600">Discount</td>
                      <td className="py-3 px-4 text-gray-500">{discount.description}</td>
                      <td className="py-3 px-4 text-gray-700">{discount.discountFreq || 'One time'}</td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">
                        {discount.type === 'percentage' ? `-${discount.value}%` : `-₹${discountAmount.toLocaleString()}`}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Cost Summary by Period */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Cost Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {costByPeriod.oneTime > 0 && (
            <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">One-Time Cost</span>
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-orange-600">₹{costByPeriod.oneTime.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Setup fees & one-time items</p>
            </div>
          )}
          {costByPeriod.yearly > 0 && (
            <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Yearly Total</span>
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-purple-600">₹{costByPeriod.yearly.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Per year</p>
            </div>
          )}
          {costByPeriod.quarterly > 0 && (
            <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Quarterly Total</span>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-green-600">₹{costByPeriod.quarterly.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Per quarter</p>
            </div>
          )}
          {costByPeriod.monthly > 0 && (
            <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Monthly Total</span>
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-blue-600">₹{costByPeriod.monthly.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Per month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


