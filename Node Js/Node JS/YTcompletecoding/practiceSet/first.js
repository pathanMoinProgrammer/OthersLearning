const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
  console.log(request.url, request.method);
  if (request.url == '/men' && request.method == 'GET') {
    fs.writeFileSync('user.txt', 'DUMMY User');
    response.write(`
      <br/>
      <br/>
      <br/>
      <br/>
      <h1>This is For Men</h1>
      <li><a href="/">HOME</a></li>
      `);
  } else if (request.url == '/woman' && request.method == 'GET') {
    fs.writeFileSync('user.txt', 'DUMMY User');
    response.write(`
      <br/>
      <br/>
      <br/>
      <br/>
      <h1>This is For woman</h1>
      <li><a href="/">HOME</a></li>
      `);
  } else if (request.url == '/shop' && request.method == 'GET') {
    fs.writeFileSync('user.txt', 'DUMMY User');
    response.write(`
      <br/>
      <br/>
      <br/>
      <br/>
      <h1>This is For shop</h1>
      <li><a href="/">HOME</a></li>
      `);
  } else if (request.url == '/cart' && request.method == 'GET') {
    fs.writeFileSync('user.txt', 'DUMMY User');
    response.write(`
      <br/>
      <br/>
      <br/>
      <br/>
      <h1>This is For cart</h1>
      <li><a href="/">HOME</a></li>
      `);
  } else {
    request.on('data', (chunk) => {
      console.log(chunk);
    });
    response.write(`
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <nav>
      <ul>
        <li><a href="/men">Men</a></li>
        <li><a href="/woman">Woman</a></li>
        <li><a href="/shop">Shop</a></li>
        <li><a href="/cart">cart</a></li>
      </ul>
    </nav>
  </body>
</html>

    `);
  }
});

server.listen(3001, () => {
  console.log('server run');
});
