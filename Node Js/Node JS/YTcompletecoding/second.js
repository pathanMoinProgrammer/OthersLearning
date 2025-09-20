let http = require('http');

// function requestlitsener(request, response){
//    console.log( 'request',request)
// }

// http.createServer(requestlitsener)

const server = http.createServer((request, response) => {
  console.log(`${request.url}`, `${request.method}`, request.headers);
  if (request.url == '/') {
    response.setHeader('Content-type', 'text/html');
    response.write('<html>');
    response.write('<head><title>Now its working is good </title> <head>');
    response.write('<body><div>basically its working </div></body>');
    response.write('</html>');
    return response.end();
  } else if (request.url == '/info') {
    response.setHeader('Content-type', 'text/html');
    response.write('<html>');
    response.
    write('<head><title>Our Information</title> <head>');
    response.write('<body><div>this is Our Information </div></body>');
    response.write('</html>');
    return response.end();
  }
  response.setHeader('Content-type', 'text/html');
  response.write('<html>');
  response.write('<head><title>Else is now </title> <head>');
  response.write('<body><div>Default is running</div></body>');
  response.write('</html>');
  response.end();
});

const port = 3001;
server.listen(port, () => {
  console.log(`server made and run for http://localhost:${port}`);
});
