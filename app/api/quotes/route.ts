import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  phoneNumber: string;
  quoteReference: string;
  projectTimeline: string;
  additionalNotes: string;
  customRequirements: string;
  productConfigurations: string;
  discounts: string;
  createdAt: string;
  status: string;
  quotation_num?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.csv');

async function readQuotes(): Promise<Quote[]> {
  if (!fs.existsSync(QUOTES_FILE)) {
    return [];
  }

  return new Promise((resolve, reject) => {
    const quotes: Quote[] = [];
    fs.createReadStream(QUOTES_FILE)
      .pipe(csv())
      .on('data', (row) => {
        quotes.push({
          id: row.id,
          clientName: row.clientName,
          clientEmail: row.clientEmail,
          companyName: row.companyName,
          phoneNumber: row.phoneNumber,
          quoteReference: row.quoteReference,
          projectTimeline: row.projectTimeline,
          additionalNotes: row.additionalNotes,
          customRequirements: row.customRequirements || '[]',
          productConfigurations: row.productConfigurations || '[]',
          discounts: row.discounts || '[]',
          createdAt: row.createdAt,
          status: row.status,
          quotation_num: row.quotation_num || '',
        });
      })
      .on('end', () => resolve(quotes))
      .on('error', reject);
  });
}

async function addQuote(quote: Omit<Quote, 'id'>): Promise<void> {
  const quotes = await readQuotes();
  
  // Generate quotation number if status is 'generated'
  let quotation_num = '';
  if (quote.status === 'generated') {
    const currentYear = new Date().getFullYear();
    const generatedQuotes = quotes.filter(q => q.status === 'generated');
    const nextNumber = generatedQuotes.length + 1;
    quotation_num = `Q-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }
  
  const newQuote: Quote = {
    id: (quotes.length + 1).toString(),
    ...quote,
    quotation_num,
  };

        const csvWriter = createObjectCsvWriter({
        path: QUOTES_FILE,
        header: [
          { id: 'id', title: 'id' },
          { id: 'clientName', title: 'clientName' },
          { id: 'clientEmail', title: 'clientEmail' },
          { id: 'companyName', title: 'companyName' },
          { id: 'phoneNumber', title: 'phoneNumber' },
          { id: 'quoteReference', title: 'quoteReference' },
          { id: 'projectTimeline', title: 'projectTimeline' },
          { id: 'additionalNotes', title: 'additionalNotes' },
          { id: 'customRequirements', title: 'customRequirements' },
          { id: 'productConfigurations', title: 'productConfigurations' },
          { id: 'discounts', title: 'discounts' },
          { id: 'createdAt', title: 'createdAt' },
          { id: 'status', title: 'status' },
          { id: 'quotation_num', title: 'quotation_num' }
        ],
        append: true,
      });

  await csvWriter.writeRecords([newQuote]);
}

async function updateQuote(quoteId: string, updatedQuote: Omit<Quote, 'id'>): Promise<void> {
  const quotes = await readQuotes();
  
  // Generate quotation number if status is being changed to 'generated'
  let quotation_num = updatedQuote.quotation_num || '';
  if (updatedQuote.status === 'generated') {
    if (!quotation_num) {
      const currentYear = new Date().getFullYear();
      const generatedQuotes = quotes.filter(q => 
        q.status === 'generated' && q.id !== quoteId
      );
      const nextNumber = generatedQuotes.length + 1;
      quotation_num = `Q-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
    }
  }
  
  const updatedQuotes = quotes.map(quote => 
    quote.id === quoteId ? { ...updatedQuote, id: quoteId, quotation_num } : quote
  );

  const csvWriter = createObjectCsvWriter({
    path: QUOTES_FILE,
    header: [
      { id: 'id', title: 'id' },
      { id: 'clientName', title: 'clientName' },
      { id: 'clientEmail', title: 'clientEmail' },
      { id: 'companyName', title: 'companyName' },
      { id: 'phoneNumber', title: 'phoneNumber' },
      { id: 'quoteReference', title: 'quoteReference' },
      { id: 'projectTimeline', title: 'projectTimeline' },
      { id: 'additionalNotes', title: 'additionalNotes' },
      { id: 'customRequirements', title: 'customRequirements' },
      { id: 'productConfigurations', title: 'productConfigurations' },
      { id: 'discounts', title: 'discounts' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'status', title: 'status' },
      { id: 'quotation_num', title: 'quotation_num' }
    ],
  });

  await csvWriter.writeRecords(updatedQuotes);
}

async function deleteQuote(quoteId: string): Promise<void> {
  const quotes = await readQuotes();
  const filteredQuotes = quotes.filter(quote => quote.id !== quoteId);

  const csvWriter = createObjectCsvWriter({
    path: QUOTES_FILE,
    header: [
      { id: 'id', title: 'id' },
      { id: 'clientName', title: 'clientName' },
      { id: 'clientEmail', title: 'clientEmail' },
      { id: 'companyName', title: 'companyName' },
      { id: 'phoneNumber', title: 'phoneNumber' },
      { id: 'quoteReference', title: 'quoteReference' },
      { id: 'projectTimeline', title: 'projectTimeline' },
      { id: 'additionalNotes', title: 'additionalNotes' },
      { id: 'customRequirements', title: 'customRequirements' },
      { id: 'productConfigurations', title: 'productConfigurations' },
      { id: 'discounts', title: 'discounts' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'status', title: 'status' },
      { id: 'quotation_num', title: 'quotation_num' }
    ],
  });

  await csvWriter.writeRecords(filteredQuotes);
}

export async function GET() {
  try {
    const quotes = await readQuotes();
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, quote, quoteId } = body;

    if (action === 'add') {
      await addQuote({
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        companyName: quote.companyName,
        phoneNumber: quote.phoneNumber,
        quoteReference: quote.quoteReference,
        projectTimeline: quote.projectTimeline,
        additionalNotes: quote.additionalNotes,
        customRequirements: JSON.stringify(quote.customRequirements || []),
        productConfigurations: JSON.stringify(quote.productConfigurations || []),
        discounts: JSON.stringify(quote.discounts || []),
        createdAt: quote.createdAt,
        status: quote.status,
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      await updateQuote(quoteId, {
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        companyName: quote.companyName,
        phoneNumber: quote.phoneNumber,
        quoteReference: quote.quoteReference,
        projectTimeline: quote.projectTimeline,
        additionalNotes: quote.additionalNotes,
        customRequirements: JSON.stringify(quote.customRequirements || []),
        productConfigurations: JSON.stringify(quote.productConfigurations || []),
        discounts: JSON.stringify(quote.discounts || []),
        createdAt: quote.createdAt,
        status: quote.status,
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      await deleteQuote(quoteId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing quote:', error);
    return NextResponse.json(
      { error: 'Failed to process quote' },
      { status: 500 }
    );
  }
} 