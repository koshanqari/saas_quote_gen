import { NextRequest, NextResponse } from 'next/server';
import { readQuoteConfig, writeQuoteConfig } from '@/lib/csv-utils';

export async function GET() {
  try {
    const config = await readQuoteConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received config data:', body);
    
    const {
      company_name,
      company_email,
      phone,
      address,
      default_currency,
      default_tax_rate,
      terms_and_conditions,
      footer_message
    } = body;

    const configData = {
      company_name,
      company_email,
      phone,
      address,
      default_currency,
      default_tax_rate: parseFloat(default_tax_rate) || 0,
      terms_and_conditions,
      footer_message,
    };

    console.log('Processed config data:', configData);
    await writeQuoteConfig(configData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in config POST:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
} 