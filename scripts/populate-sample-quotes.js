const csv = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const csvWriter = csv({
  path: path.join(process.cwd(), 'data', 'quotes.csv'),
  header: [
    { id: 'id', title: 'id' },
    { id: 'clientName', title: 'clientName' },
    { id: 'clientEmail', title: 'clientEmail' },
    { id: 'companyName', title: 'companyName' },
    { id: 'phoneNumber', title: 'phoneNumber' },
    { id: 'quoteReference', title: 'quoteReference' },
    { id: 'projectTimeline', title: 'projectTimeline' },
    { id: 'additionalNotes', title: 'additionalNotes' },
    { id: 'createdAt', title: 'createdAt' },
    { id: 'status', title: 'status' }
  ]
});

const sampleQuotes = [
  {
    id: '1',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah.johnson@techstartup.com',
    companyName: 'TechStartup Inc.',
    phoneNumber: '+1 (555) 123-4567',
    quoteReference: 'E-commerce Platform Development',
    projectTimeline: '4 months',
    additionalNotes: 'Need responsive design, payment integration, and inventory management system. Priority on user experience and mobile optimization.',
    createdAt: '2024-01-15T10:30:00.000Z',
    status: 'generated'
  },
  {
    id: '2',
    clientName: 'Michael Chen',
    clientEmail: 'michael.chen@innovatecorp.com',
    companyName: 'InnovateCorp Solutions',
    phoneNumber: '+1 (555) 234-5678',
    quoteReference: 'Mobile App Development',
    projectTimeline: '6 months',
    additionalNotes: 'iOS and Android app for food delivery service. Features include real-time tracking, payment processing, and driver management.',
    createdAt: '2024-01-20T14:45:00.000Z',
    status: 'draft'
  },
  {
    id: '3',
    clientName: 'Emily Rodriguez',
    clientEmail: 'emily.rodriguez@healthtech.com',
    companyName: 'HealthTech Innovations',
    phoneNumber: '+1 (555) 345-6789',
    quoteReference: 'Healthcare Management System',
    projectTimeline: '8 months',
    additionalNotes: 'HIPAA compliant system for patient management, appointment scheduling, and medical records. Must include reporting and analytics dashboard.',
    createdAt: '2024-01-25T09:15:00.000Z',
    status: 'generated'
  },
  {
    id: '4',
    clientName: 'David Thompson',
    clientEmail: 'david.thompson@fintechpro.com',
    companyName: 'FinTech Pro',
    phoneNumber: '+1 (555) 456-7890',
    quoteReference: 'Financial Analytics Dashboard',
    projectTimeline: '3 months',
    additionalNotes: 'Real-time financial data visualization with interactive charts, risk assessment tools, and automated reporting features.',
    createdAt: '2024-02-01T11:20:00.000Z',
    status: 'draft'
  },
  {
    id: '5',
    clientName: 'Lisa Wang',
    clientEmail: 'lisa.wang@edutech.com',
    companyName: 'EduTech Solutions',
    phoneNumber: '+1 (555) 567-8901',
    quoteReference: 'Learning Management System',
    projectTimeline: '5 months',
    additionalNotes: 'Online learning platform with video streaming, quiz system, progress tracking, and certificate generation. Must support multiple languages.',
    createdAt: '2024-02-05T16:30:00.000Z',
    status: 'generated'
  },
  {
    id: '6',
    clientName: 'Robert Kim',
    clientEmail: 'robert.kim@logisticsplus.com',
    companyName: 'Logistics Plus',
    phoneNumber: '+1 (555) 678-9012',
    quoteReference: 'Supply Chain Management System',
    projectTimeline: '7 months',
    additionalNotes: 'End-to-end supply chain tracking with inventory management, route optimization, and real-time notifications. Integration with existing ERP systems required.',
    createdAt: '2024-02-10T13:45:00.000Z',
    status: 'draft'
  },
  {
    id: '7',
    clientName: 'Jennifer Martinez',
    clientEmail: 'jennifer.martinez@retailtech.com',
    companyName: 'RetailTech Solutions',
    phoneNumber: '+1 (555) 789-0123',
    quoteReference: 'Point of Sale System',
    projectTimeline: '4 months',
    additionalNotes: 'Modern POS system with barcode scanning, receipt printing, inventory tracking, and sales reporting. Must integrate with accounting software.',
    createdAt: '2024-02-15T10:00:00.000Z',
    status: 'generated'
  },
  {
    id: '8',
    clientName: 'Alex Turner',
    clientEmail: 'alex.turner@marketingpro.com',
    companyName: 'Marketing Pro Agency',
    phoneNumber: '+1 (555) 890-1234',
    quoteReference: 'Marketing Automation Platform',
    projectTimeline: '6 months',
    additionalNotes: 'Email marketing automation, social media management, lead scoring, and campaign analytics. Integration with CRM systems needed.',
    createdAt: '2024-02-20T15:20:00.000Z',
    status: 'draft'
  },
  {
    id: '9',
    clientName: 'Maria Garcia',
    clientEmail: 'maria.garcia@realestate.com',
    companyName: 'Real Estate Pro',
    phoneNumber: '+1 (555) 901-2345',
    quoteReference: 'Property Management System',
    projectTimeline: '5 months',
    additionalNotes: 'Property listing management, tenant portal, maintenance requests, and financial reporting. Must include document management and e-signing capabilities.',
    createdAt: '2024-02-25T12:10:00.000Z',
    status: 'generated'
  },
  {
    id: '10',
    clientName: 'James Wilson',
    clientEmail: 'james.wilson@consulting.com',
    companyName: 'Strategic Consulting Group',
    phoneNumber: '+1 (555) 012-3456',
    quoteReference: 'Client Portal Development',
    projectTimeline: '3 months',
    additionalNotes: 'Secure client portal with document sharing, project tracking, and communication tools. Must include role-based access control and audit trails.',
    createdAt: '2024-03-01T14:30:00.000Z',
    status: 'draft'
  }
];

async function populateQuotes() {
  try {
    await csvWriter.writeRecords(sampleQuotes);
    console.log('✅ Sample quotes have been successfully added to quotes.csv');
    console.log(`📊 Added ${sampleQuotes.length} sample quotes`);
    
    // Display a few sample quotes
    console.log('\n📋 Sample quotes added:');
    sampleQuotes.slice(0, 3).forEach((quote, index) => {
      console.log(`${index + 1}. ${quote.quoteReference} - ${quote.clientName} (${quote.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error populating quotes:', error);
  }
}

populateQuotes(); 