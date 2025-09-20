const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
  console.log(request.url);
  if (
    request.url.toLocaleLowerCase() == '/submit-form' &&
    request.method == 'POST'
  ) {
    let body = [];

    request.on('data', (chunk) => {
      console.log('CHUNK', chunk);
      body.push(chunk);
    });
    request.on('end', () => {
      const fullbody = Buffer.concat(body).toString();
      const params = new URLSearchParams(fullbody);
      // console.log('fullbody', params);
      // let reqbody = {};
      // for (let [key, value] of params.entries()) {
      //   reqbody[key] = value;
      // }
      // console.log('reqbody', reqbody);
      const bodyObj = Object.fromEntries(params);
      console.log('bodyObj', bodyObj);
    fs.writeFileSync('user.txt', JSON.stringify(bodyObj));

    });

    response.statusCode = 302;
    response.setHeader('location', '/ ');
    return response.end();
  }

  response.write('<html>');
  response.write('<body>');
  response.write('<div>');
  response.write('<h1>Enter Your Details</h1><hr><br>');

  response.write('<form action="/submit-form" method="POST" >');

  response.write(
    '<input type="text" name="username" placeholder="Enter Your Name" id="username" /> <br> <br>',
  );
  response.write('<label>Gender</label> <br> <br> ');
  response.write('<input type="radio" name="gender" id="male" value="male" />');
  response.write('<label for="male" >Male</label> <br>');
  response.write(
    '<input type="radio" name="gender"  id="female"value="female" />',
  );
  response.write('<label for="female" >Female</label> <br>');
  response.write('<input type="submit" value="submit" />');

  response.write('</form>');

  response.write('</div>');
  response.write('<body>');
  response.write('</html>');
});

server.listen(3001, () => {
  console.log('server run');
});
