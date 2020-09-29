const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

/////////////////////////////////////
// File

// Blocking, synchronous way
//const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
//console.log(textIn);
//const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
//fs.writeFileSync('./txt/output.txt', textOut);
//console.log('File written!');

// Non-blocking, asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('ERROR!');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data1);
//             console.log(data2);
//             console.log(data3);
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('Your file has been written !');
//             });
//         });
//     });
// });

// console.log('Will read file!');

/////////////////////////////////////
// SERVER

// Reading DATA_reading html
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

// Reading DATA_reading json
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
const slugs = dataObj.map((el) =>
  slugify(el.productName, {
    lower: true,
  })
);

// 1_Create the server
// specify different responses with different quests
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  console.log(url.parse(req.url, true));

  // req: url === '/' || url === '/overview'; res: Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    // map json data with html(card) template
    const cardsHtml = dataObj
      .map((el, i) => replaceTemplate(tempCard, el, slugs[i]))
      .join('');
    // Insert html(card) into html(overview)
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    // respond with 'output',
    res.end(output);

    // req: url === '/product'; res: Product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });

    const product = dataObj[slugs.indexOf(query.id)];
    console.log(product);

    const output = replaceTemplate(tempProduct, product, slugs);
    res.end(output);

    // req: url === '/api'; res: API
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(data);

    // req: url !== all routs above; res: Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

// 2_Start the server
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
