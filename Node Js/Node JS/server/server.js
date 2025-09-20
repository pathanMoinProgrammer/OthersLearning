const http = require('http');
const calcReqRes = require('./calc')


const server = http.createServer(calcReqRes);

const port = 3001;
server.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
