// Core Module
const http = require('http');

// External Module
// const calcReqRes = require('./calc')

const express = require('express');

const app = express();

// Local Module
const server = http.createServer(app);

app.use('/', (req, res, next) => {
  console.log('this is Sended by Firstt');
  if (req.url == '/') {
    res.send('<h2 >Go To ABiut</h2>');
  }
  next();
});

app.use('/ABiut', (req, res, next) => {
  console.log('this is Sended by seconds');


  next();

});

const port = 3002;
server.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
