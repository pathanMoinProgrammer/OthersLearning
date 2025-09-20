const fs = require('fs');
function calcReqRes(request, response) {
  if (request.url === '/') {
    response.setHeader('Content-type', 'text/html');
    response.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
<br />
<br />
<br />

<br />
<br />
<h1>Calculator</h1>
  <form action="/calculate" method="post">
    <input type='Number' defaultValue="2" placeholder="2" name="num1" />
    <input type='Number' defaultValue="5" placeholder="5" name="num2" />

    <br><br>
    <input type='radio' name="assign" value="+" id="+"  />+<br/>
    <input type='radio' name="assign"  value="-" id="-" />-<br/>
    <input type='radio' name="assign"  value="*" id="*" />*<br/>
    <input type='radio' name="assign"  value="/" id="/" />/<br/>
    <br/>
    <br/>
    <input type="submit" value="submit" />
  </form>
</body>
</html>`);
  } else if (request.url == '/calculate' && request.method == 'POST') {
    console.log(request.url);
    const body = [];
    request.on('data', (chunk) => body.push(chunk));
    request.on('end', () => {
      const parse = Buffer.concat(body).toString();
      const data = new URLSearchParams(parse);
      const boddy = Object.fromEntries(data);

      // setTimeout(()=>{
      //    response.statuscode = 302
      // response.setHeader('Location', '/')
      // }, 4000)

      const result =
        boddy.assign == '+'
          ? +boddy.num1 + +boddy.num2
          : boddy.assign === '-'
          ? +boddy.num1 - +boddy.num2
          : boddy.assign === '*'
          ? +boddy.num1 * +boddy.num2
          : boddy.assign === '/'
          ? +boddy.num1 / +boddy.num2
          : +boddy.num1 + +boddy.num2;
      const obj = { ...boddy, result: result };

      fs.appendFileSync('user.json', JSON.stringify(obj));

      response.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
<br />
<br />
<br />

<br />
<br />
<br />
<br />
   <h1>Result is : ${result}</h1>
</body>
</html>`);
    });
  }
}

module.exports = calcReqRes;
