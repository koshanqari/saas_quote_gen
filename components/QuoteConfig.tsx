'use client';

import { useState, useEffect } from 'react';
import { QuoteConfig } from '@/lib/csv-utils';

export default function QuoteConfigComponent() {
  const [config, setConfig] = useState<QuoteConfig>({
    company_name: '',
    company_email: '',
    phone: '',
    address: '',
    default_currency: 'USD',
    default_tax_rate: 0,
    validity_days: 30,
    terms_and_conditions: '',
    footer_message: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      console.log('Saving config:', config);
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Save result:', result);
        alert('Configuration saved successfully!');
        // Refresh the config data
        await fetchConfig();
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        alert('Failed to save configuration.');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Configuration</h2>
        <p className="text-gray-600">Configure your company details, financial settings, and template options</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={config.company_name}
                onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                className="input-field"
                placeholder="Enter your company name"
                required
              />
            </div>
            <div>
              <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Company Email
              </label>
              <input
                type="email"
                id="companyEmail"
                value={config.company_email}
                onChange={(e) => setConfig({ ...config, company_email: e.target.value })}
                className="input-field"
                placeholder="contact@yourcompany.com"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              className="input-field"
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Enter your company address"
              required
            />
          </div>
        </div>

        {/* Financial Settings */}
        <div className="card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Financial Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                id="defaultCurrency"
                value={config.default_currency}
                onChange={(e) => setConfig({ ...config, default_currency: e.target.value })}
                className="input-field"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700 mb-2">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                id="defaultTaxRate"
                min="0"
                max="100"
                step="0.01"
                value={config.default_tax_rate === 0 ? '' : config.default_tax_rate}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfig({ 
                    ...config, 
                    default_tax_rate: value === '' ? 0 : parseFloat(value) || 0 
                  });
                }}
                className="input-field"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Default tax rate applied to quotes (0 for no tax)
              </p>
            </div>
          </div>
        </div>

        {/* Template Settings */}
        <div className="card bg-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Template Settings
          </h3>
          <div className="space-y-4">
            {/* Valid For Section */}
            <div>
              <label htmlFor="validityDays" className="block text-sm font-medium text-gray-700 mb-2">
                Valid For (Days)
              </label>
              <input
                type="number"
                id="validityDays"
                min="1"
                max="365"
                value={config.validity_days === 0 ? '' : config.validity_days}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfig({ 
                    ...config, 
                    validity_days: value === '' ? 30 : parseInt(value) || 30 
                  });
                }}
                className="input-field w-32"
                placeholder="30"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of days this quote will be valid from the date of issue
              </p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700">
                  Terms and Conditions
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const lines = config.terms_and_conditions.split('\n').filter(line => line.trim());
                      const bulletPoints = lines.map(line => `• ${line.trim()}`).join('\n');
                      setConfig({ ...config, terms_and_conditions: bulletPoints });
                    }}
                    className="inline-flex items-center px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium rounded-lg transition-colors duration-200"
                    title="Convert to bullet points"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-1l-4-4z" />
                    </svg>
                    Add Bullets
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const lines = config.terms_and_conditions.split('\n').filter(line => line.trim());
                      const noBullets = lines.map(line => line.replace(/^•\s*/, '')).join('\n');
                      setConfig({ ...config, terms_and_conditions: noBullets });
                    }}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors duration-200"
                    title="Remove bullet points"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Bullets
                  </button>
                </div>
              </div>
              <textarea
                id="termsAndConditions"
                value={config.terms_and_conditions}
                onChange={(e) => setConfig({ ...config, terms_and_conditions: e.target.value })}
                className="input-field"
                rows={6}
                placeholder="Enter your terms and conditions that will appear on all quotes. You can use the 'Add Bullets' button to convert each line to bullet points."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This text will appear on all generated quotes. Use the 'Add Bullets' button to convert each line to bullet points.
              </p>
              
              {/* Bullet Points Preview */}
              {config.terms_and_conditions && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Preview:</h5>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {config.terms_and_conditions}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="footerMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Footer Message
              </label>
              <textarea
                id="footerMessage"
                value={config.footer_message}
                onChange={(e) => setConfig({ ...config, footer_message: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Enter a message that will appear at the bottom of all quotes"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This message will appear at the bottom of all generated quotes
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card bg-amber-50 border-amber-200">
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Configuration Preview
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Company Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {config.company_name || 'Not set'}</div>
                <div><span className="font-medium">Email:</span> {config.company_email || 'Not set'}</div>
                <div><span className="font-medium">Phone:</span> {config.phone || 'Not set'}</div>
                <div><span className="font-medium">Address:</span> {config.address || 'Not set'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Financial Settings</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Currency:</span> {config.default_currency}</div>
                <div><span className="font-medium">Tax Rate:</span> {config.default_tax_rate}%</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Template Settings</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Valid For:</span> {config.validity_days} days</div>
                <div><span className="font-medium">Terms & Conditions:</span> {config.terms_and_conditions ? 'Set' : 'Not set'}</div>
                <div><span className="font-medium">Footer Message:</span> {config.footer_message ? 'Set' : 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
} 