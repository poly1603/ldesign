import PptxGenJS from 'pptxgenjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new presentation
const pres = new PptxGenJS();

// Presentation properties
pres.author = 'Demo Author';
pres.company = 'Demo Company';
pres.revision = '1';
pres.subject = 'Demo Presentation';
pres.title = 'Sample PowerPoint Presentation';

// Slide 1 - Title Slide
let slide1 = pres.addSlide();
slide1.background = { fill: '003366' };
slide1.addText('Sample Presentation', {
  x: 0.5,
  y: '30%',
  w: '90%',
  h: 1.5,
  fontSize: 44,
  color: 'FFFFFF',
  align: 'center',
  bold: true
});
slide1.addText('Created with PptxGenJS', {
  x: 0.5,
  y: '50%',
  w: '90%',
  h: 0.75,
  fontSize: 24,
  color: 'DDDDDD',
  align: 'center'
});

// Slide 2 - Bullet Points
let slide2 = pres.addSlide();
slide2.addText('Key Features', {
  x: 0.5,
  y: 0.5,
  w: '90%',
  h: 0.75,
  fontSize: 32,
  color: '003366',
  bold: true
});
slide2.addText([
  { text: '• First bullet point with ', options: { fontSize: 18 } },
  { text: 'bold text', options: { fontSize: 18, bold: true, color: 'CC0000' } },
  { text: ' example\n', options: { fontSize: 18 } },
  { text: '• Second bullet with ', options: { fontSize: 18, bullet: false } },
  { text: 'italic text', options: { fontSize: 18, italic: true, color: '0066CC' } },
  { text: '\n• Third bullet point\n', options: { fontSize: 18 } },
  { text: '  - Sub-bullet 1\n', options: { fontSize: 16, color: '666666' } },
  { text: '  - Sub-bullet 2', options: { fontSize: 16, color: '666666' } }
], {
  x: 0.5,
  y: 1.5,
  w: '90%',
  h: 4
});

// Slide 3 - Table
let slide3 = pres.addSlide();
slide3.addText('Data Table Example', {
  x: 0.5,
  y: 0.5,
  w: '90%',
  h: 0.75,
  fontSize: 28,
  color: '003366',
  bold: true
});

const tableData = [
  [
    { text: 'Product', options: { fontSize: 14, bold: true, color: 'FFFFFF', fill: '003366' } },
    { text: 'Q1', options: { fontSize: 14, bold: true, color: 'FFFFFF', fill: '003366' } },
    { text: 'Q2', options: { fontSize: 14, bold: true, color: 'FFFFFF', fill: '003366' } },
    { text: 'Q3', options: { fontSize: 14, bold: true, color: 'FFFFFF', fill: '003366' } },
    { text: 'Q4', options: { fontSize: 14, bold: true, color: 'FFFFFF', fill: '003366' } }
  ],
  ['Product A', '100', '120', '135', '150'],
  ['Product B', '85', '95', '105', '120'],
  ['Product C', '200', '210', '225', '240']
];

slide3.addTable(tableData, {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 2.5,
  fontSize: 12,
  border: { type: 'solid', color: '999999', pt: 1 },
  align: 'center',
  valign: 'middle'
});

// Slide 4 - Mixed Content
let slide4 = pres.addSlide();
slide4.background = { fill: 'F5F5F5' };
slide4.addText('Mixed Content Slide', {
  x: 0.5,
  y: 0.3,
  w: '90%',
  h: 0.75,
  fontSize: 30,
  color: '003366',
  bold: true
});

slide4.addText('This slide demonstrates various text styles and colors:', {
  x: 0.5,
  y: 1.2,
  w: '90%',
  h: 0.5,
  fontSize: 16
});

slide4.addText([
  { text: 'Regular text, ', options: { fontSize: 14 } },
  { text: 'Bold text, ', options: { fontSize: 14, bold: true } },
  { text: 'Italic text, ', options: { fontSize: 14, italic: true } },
  { text: 'Underlined text', options: { fontSize: 14, underline: true } }
], {
  x: 0.5,
  y: 2,
  w: '90%',
  h: 0.5
});

slide4.addText([
  { text: 'Red text, ', options: { fontSize: 14, color: 'FF0000' } },
  { text: 'Green text, ', options: { fontSize: 14, color: '00FF00' } },
  { text: 'Blue text, ', options: { fontSize: 14, color: '0000FF' } },
  { text: 'Custom color', options: { fontSize: 14, color: 'FF6600' } }
], {
  x: 0.5,
  y: 2.7,
  w: '90%',
  h: 0.5
});

slide4.addText('Different font sizes:', {
  x: 0.5,
  y: 3.5,
  w: '90%',
  h: 0.4,
  fontSize: 14
});

slide4.addText([
  { text: '12pt, ', options: { fontSize: 12 } },
  { text: '16pt, ', options: { fontSize: 16 } },
  { text: '20pt, ', options: { fontSize: 20 } },
  { text: '24pt', options: { fontSize: 24 } }
], {
  x: 0.5,
  y: 4,
  w: '90%',
  h: 0.8
});

// Slide 5 - Final Slide
let slide5 = pres.addSlide();
slide5.background = { fill: '003366' };
slide5.addText('Thank You!', {
  x: 0.5,
  y: '35%',
  w: '90%',
  h: 1.5,
  fontSize: 48,
  color: 'FFFFFF',
  align: 'center',
  bold: true
});
slide5.addText('Questions?', {
  x: 0.5,
  y: '55%',
  w: '90%',
  h: 0.75,
  fontSize: 28,
  color: 'DDDDDD',
  align: 'center'
});

// Save the presentation
const outputPath = join(__dirname, 'sample.pptx');
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✓ Created sample.pptx successfully!`);
    console.log(`  Location: ${outputPath}`);
    console.log('\nYou can now test the PowerPoint viewer with this file.');
  })
  .catch(err => {
    console.error('Error creating PowerPoint file:', err);
  });