import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  website_link: string;
  key_features: string;
  setup_fee: number;
  pricing_plans: string; // JSON string
  custom_elements: string; // JSON string
  price?: number; // Optional for backward compatibility
  pricing_model?: string; // Optional for backward compatibility
}

export interface QuoteConfig {
  // Company Information
  company_name: string;
  company_email: string;
  phone: string;
  address: string;
  
  // Financial Settings
  default_currency: string;
  default_tax_rate: number;
  
  // Template Settings
  terms_and_conditions: string;
  footer_message: string;
  validity_days?: number; // Optional for backward compatibility
}

export interface Quote {
  id: string;
  client_name: string;
  products: string;
  total: number;
  date: string;
  valid_until: string;
}

export interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
  duration: number;
  discount: number;
  price: number;
  total: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function readProducts(): Promise<Product[]> {
  const filePath = path.join(DATA_DIR, 'products.csv');
  
  if (!fs.existsSync(filePath)) {
    return [];
  }

  return new Promise((resolve, reject) => {
    const products: Product[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        products.push({
          id: row.id,
          name: row.name,
          category: row.category || '',
          description: row.description,
          website_link: row.website_link || '',
          key_features: row.key_features || '',
          setup_fee: parseFloat(row.setup_fee) || 0,
          pricing_plans: row.pricing_plans || '[]',
          custom_elements: row.custom_elements || '[]',
        });
      })
      .on('end', () => resolve(products))
      .on('error', reject);
  });
}

export async function writeProducts(products: Product[]): Promise<void> {
  const filePath = path.join(DATA_DIR, 'products.csv');
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'id' },
      { id: 'name', title: 'name' },
      { id: 'category', title: 'category' },
      { id: 'description', title: 'description' },
      { id: 'website_link', title: 'website_link' },
      { id: 'key_features', title: 'key_features' },
      { id: 'setup_fee', title: 'setup_fee' },
      { id: 'pricing_plans', title: 'pricing_plans' },
      { id: 'custom_elements', title: 'custom_elements' },
    ],
  });

  await csvWriter.writeRecords(products);
}

export async function readQuoteConfig(): Promise<QuoteConfig> {
  const filePath = path.join(DATA_DIR, 'quote_config.csv');
  
  if (!fs.existsSync(filePath)) {
    return {
      company_name: 'Your Company',
      company_email: 'contact@yourcompany.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business Street, Suite 100, City, State 12345',
      default_currency: 'USD',
      default_tax_rate: 0,
      terms_and_conditions: 'Standard terms and conditions apply. Payment is due within 30 days of invoice date.',
      footer_message: 'Thank you for considering our services.',
    };
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        resolve({
          company_name: row.company_name || 'Your Company',
          company_email: row.company_email || 'contact@yourcompany.com',
          phone: row.phone || '+1 (555) 123-4567',
          address: row.address || '123 Business Street, Suite 100, City, State 12345',
          default_currency: row.default_currency || 'USD',
          default_tax_rate: parseFloat(row.default_tax_rate) || 0,
          terms_and_conditions: row.terms_and_conditions || 'Standard terms and conditions apply.',
          footer_message: row.footer_message || 'Thank you for considering our services.',
        });
      })
      .on('error', reject);
  });
}

export async function writeQuoteConfig(config: QuoteConfig): Promise<void> {
  const filePath = path.join(DATA_DIR, 'quote_config.csv');
  
  console.log('Writing config to:', filePath);
  console.log('Config data:', config);
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'company_name', title: 'company_name' },
      { id: 'company_email', title: 'company_email' },
      { id: 'phone', title: 'phone' },
      { id: 'address', title: 'address' },
      { id: 'default_currency', title: 'default_currency' },
      { id: 'default_tax_rate', title: 'default_tax_rate' },
      { id: 'terms_and_conditions', title: 'terms_and_conditions' },
      { id: 'footer_message', title: 'footer_message' },
    ],
  });

  try {
    await csvWriter.writeRecords([config]);
    console.log('Config saved successfully');
  } catch (error) {
    console.error('Error writing config:', error);
    throw error;
  }
}

export async function readQuotes(): Promise<Quote[]> {
  const filePath = path.join(DATA_DIR, 'quotes.csv');
  
  if (!fs.existsSync(filePath)) {
    return [];
  }

  return new Promise((resolve, reject) => {
    const quotes: Quote[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        quotes.push({
          id: row.id,
          client_name: row.client_name,
          products: row.products,
          total: parseFloat(row.total),
          date: row.date,
          valid_until: row.valid_until,
        });
      })
      .on('end', () => resolve(quotes))
      .on('error', reject);
  });
}

export async function writeQuotes(quotes: Quote[]): Promise<void> {
  const filePath = path.join(DATA_DIR, 'quotes.csv');
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'id' },
      { id: 'client_name', title: 'client_name' },
      { id: 'products', title: 'products' },
      { id: 'total', title: 'total' },
      { id: 'date', title: 'date' },
      { id: 'valid_until', title: 'valid_until' },
    ],
  });

  await csvWriter.writeRecords(quotes);
}

export async function addQuote(quote: Omit<Quote, 'id'>): Promise<void> {
  const quotes = await readQuotes();
  const newQuote: Quote = {
    ...quote,
    id: uuidv4(),
  };
  quotes.push(newQuote);
  await writeQuotes(quotes);
}

export function calculateQuoteTotal(items: QuoteItem[]): number {
  return items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity * item.duration;
    const discount = itemTotal * (item.discount / 100);
    return total + (itemTotal - discount);
  }, 0);
} 