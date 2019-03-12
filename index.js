'use strict';

const express = require('express');

const cors = require('cors'); // import cors from 'cors';

require('dotenv').config();

const app = express();

const build = `${__dirname}/build`;

app.use(express.static(build));
app.use(cors);

app.get('*', (request, response) => {
  response.sendFile(`${build}/index.html`);
});

app.listen(process.env.PORT, () => {
  console.log('__SERVER_UP__', process.env.PORT); // eslint-disable-line
});
