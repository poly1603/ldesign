const fs = require('fs');
const path = require('path');
const officegen = require('officegen');

// Create Word document
let docx = officegen('docx');

// Document properties
docx.setDocSubject('Example Document');
docx.setDocKeywords(['office', 'viewer', 'sample']);
docx.setDescription('A sample Word document for testing the office viewer');

// Add title
let pObj = docx.createP({align: 'center'});
pObj.addText('Office Document Viewer', {
  bold: true,
  font_size: 24,
  color: '000080'
});

// Add subtitle
pObj = docx.createP({align: 'center'});
pObj.addText('Sample Word Document', {
  italic: true,
  font_size: 16,
  color: '606060'
});

// Add paragraph with styling
pObj = docx.createP();
pObj.addText('This is a sample document created to test the office document viewer library. ');
pObj.addText('This text is bold', {bold: true});
pObj.addText(' and ');
pObj.addText('this text is italic', {italic: true});
pObj.addText('. We can also have ');
pObj.addText('underlined text', {underline: true});
pObj.addText(' and ');
pObj.addText('colored text', {color: 'FF0000'});
pObj.addText('.');

// Add heading
pObj = docx.createP();
pObj.addText('Features', {
  bold: true,
  font_size: 18,
  color: '000080'
});

// Add bullet list
pObj = docx.createListOfDots();
pObj.addText('High-fidelity document rendering');

pObj = docx.createListOfDots();
pObj.addText('Support for Word, Excel, and PowerPoint files');

pObj = docx.createListOfDots();
pObj.addText('Interactive viewing experience');

pObj = docx.createListOfDots();
pObj.addText('Cross-browser compatibility');

// Add numbered list heading
pObj = docx.createP();
pObj.addText('Installation Steps', {
  bold: true,
  font_size: 18,
  color: '000080'
});

// Add numbered list
pObj = docx.createListOfNumbers();
pObj.addText('Install the office-document library');

pObj = docx.createListOfNumbers();
pObj.addText('Import the required renderer');

pObj = docx.createListOfNumbers();
pObj.addText('Initialize the renderer with a container element');

pObj = docx.createListOfNumbers();
pObj.addText('Load your document file');

// Add table heading
pObj = docx.createP();
pObj.addText('Supported Formats', {
  bold: true,
  font_size: 18,
  color: '000080'
});

// Create table
const table = [
  ['Format', 'Extension', 'Renderer', 'Status'],
  ['Word', '.docx', 'docx-preview', 'Fully Supported'],
  ['Excel', '.xlsx', 'x-data-spreadsheet', 'Fully Supported'],
  ['PowerPoint', '.pptx', 'Custom Renderer', 'Basic Support']
];

const tableStyle = {
  tableColWidth: 2500,
  tableSize: 24,
  tableAlign: 'left',
  tableFontFamily: 'Arial',
  borders: true
};

docx.createTable(table, tableStyle);

// Add more content
pObj = docx.createP();
pObj.addText('Code Example', {
  bold: true,
  font_size: 18,
  color: '000080'
});

pObj = docx.createP();
pObj.addText('Here is how you can use the Word renderer:', {
  font_size: 12
});

pObj = docx.createP({
  backline: 'E0E0E0',
  align: 'left'
});
pObj.addText('import { WordRenderer } from "office-document";\n', {font_face: 'Courier New', font_size: 11});
pObj.addText('\n');
pObj.addText('const renderer = new WordRenderer();\n', {font_face: 'Courier New', font_size: 11});
pObj.addText('await renderer.render(file, container);\n', {font_face: 'Courier New', font_size: 11});

// Add footer
pObj = docx.createP();
pObj.addLineBreak();
pObj.addText('This document was generated programmatically for testing purposes.', {
  italic: true,
  font_size: 10,
  color: '808080'
});

// Save the document
const outputPath = path.join(__dirname, '..', 'samples', 'sample.docx');
const out = fs.createWriteStream(outputPath);

out.on('error', (err) => {
  console.error('Error writing file:', err);
});

out.on('close', () => {
  console.log('Word document created successfully at:', outputPath);
});

docx.generate(out);