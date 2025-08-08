const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const DATA_DIR = path.join(process.cwd(), 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.csv');

async function migrateQuotes() {
  try {
    // Read existing quotes
    const quotes = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(QUOTES_FILE)
        .pipe(csv())
        .on('data', (row) => {
          quotes.push({
            id: row.id,
            clientName: row.clientName || '',
            clientEmail: row.clientEmail || '',
            companyName: row.companyName || '',
            phoneNumber: row.phoneNumber || '',
            quoteReference: row.quoteReference || '',
            projectTimeline: row.projectTimeline || '',
            additionalNotes: row.additionalNotes || '',
            customRequirements: row.customRequirements || '[]',
            productConfigurations: row.productConfigurations || '[]',
            discounts: row.discounts || '[]',
            createdAt: row.createdAt || new Date().toISOString(),
            status: row.status || 'draft'
          });
        })
        .on('end', async () => {
          try {
            // Write back with new structure
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
                { id: 'status', title: 'status' }
              ],
            });

            await csvWriter.writeRecords(quotes);
            console.log('Migration completed successfully!');
            console.log(`Updated ${quotes.length} quotes with new fields.`);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateQuotes()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateQuotes };
