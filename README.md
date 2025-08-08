# SaaS Quote Generator

A full-stack web application for generating professional quotes for SaaS businesses. Built with Next.js, TypeScript, and TailwindCSS.

## Features

### 🎯 Quote Builder
- Select products from a configurable product list
- Set quantities, durations, and apply discounts
- Real-time total calculation
- Professional quote preview with company branding
- PDF download functionality
- Save quotes to CSV storage

### 📊 Quote History
- View all previously created quotes
- Search and filter quotes
- Re-download any quote as PDF
- Detailed quote information display

### ⚙️ Admin Panel
- **Products Configuration**: Add, edit, and delete products
- **Quote Configuration**: Set company details, validity periods, and footer notes
- CSV-based data storage for easy management

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS
- **Data Storage**: CSV files (easily replaceable with database)
- **PDF Generation**: jsPDF + html2canvas
- **CSV Handling**: csv-parser, csv-writer

## Project Structure

```
saas-quote-generator/
├── app/
│   ├── api/                    # API routes
│   │   ├── products/          # Product CRUD operations
│   │   ├── config/            # Quote configuration
│   │   └── quotes/            # Quote operations
│   ├── admin/                 # Admin panel page
│   ├── quote-builder/         # Quote builder page
│   ├── quote-history/         # Quote history page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                # Reusable components
│   ├── ProductSelector.tsx    # Product selection component
│   ├── QuotePreview.tsx       # Quote preview and PDF generation
│   ├── ProductsConfig.tsx     # Product management
│   └── QuoteConfig.tsx        # Quote configuration
├── lib/
│   └── csv-utils.ts          # CSV utility functions
├── data/                     # CSV data files
│   ├── products.csv          # Product data
│   ├── quote_config.csv      # Quote configuration
│   └── quotes.csv            # Quote history
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd saas-quote-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Initial Setup

1. Navigate to the Admin Panel (`/admin`)
2. Configure your company details in the "Quote Config" tab
3. Add your products in the "Products Config" tab

### 2. Creating Quotes

1. Go to the Quote Builder (`/quote-builder`)
2. Enter client information
3. Select products and set quantities/durations
4. Apply discounts if needed
5. Preview the quote
6. Save the quote or download as PDF

### 3. Managing Quotes

1. View all quotes in Quote History (`/quote-history`)
2. Click "View" to see any quote
3. Download quotes as PDF

## Data Storage

The application uses CSV files for data storage, making it easy to:
- Backup and version control your data
- Import/export data easily
- Replace with a database later

### CSV File Structure

**products.csv**
```csv
id,name,description,pricing_model,price
1,Basic Plan,Essential features for small teams,per_user,29
```

**quote_config.csv**
```csv
company_name,validity_days,footer_note
TechCorp Solutions,30,Thank you for considering our services.
```

**quotes.csv**
```csv
id,client_name,products,total,date,valid_until
```

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `app/globals.css` for custom styles

### Data Structure
- Edit CSV files directly or use the admin panel
- Modify `lib/csv-utils.ts` for data structure changes

### PDF Generation
- Customize quote layout in `components/QuotePreview.tsx`
- Modify PDF generation settings in the download function

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- User authentication and authorization
- Email quote delivery
- Advanced pricing models
- Quote templates
- Analytics and reporting
- Multi-tenant support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub. 