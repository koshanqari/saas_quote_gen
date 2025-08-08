import { NextRequest, NextResponse } from 'next/server';
import { readProducts, writeProducts, Product } from '@/lib/csv-utils';

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, product, products } = body;

    if (action === 'add' && product) {
      const existingProducts = await readProducts();
      const newProduct: Product = {
        id: (existingProducts.length + 1).toString(),
        name: product.name,
        category: product.category,
        description: product.description,
        website_link: product.website_link,
        key_features: product.key_features,
        setup_fee: product.setup_fee,
        pricing_plans: product.pricing_plans,
        custom_elements: product.custom_elements,
      };
      existingProducts.push(newProduct);
      await writeProducts(existingProducts);
      return NextResponse.json(newProduct);
    }

    if (action === 'update' && products) {
      await writeProducts(products);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && product) {
      const existingProducts = await readProducts();
      const filteredProducts = existingProducts.filter(p => p.id !== product.id);
      await writeProducts(filteredProducts);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing data' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update products' },
      { status: 500 }
    );
  }
} 