var html_to_pdf = require('html-pdf-node');

let options = { format: 'A4' };
let file = [{ url: "http://localhost:3000", name: 'example.pdf' }];

html_to_pdf.generatePdfs(file, options).then(output => {
  console.log("PDF Buffer:-", output); 
});