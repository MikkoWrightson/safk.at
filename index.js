const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const ruoke = require('./routes');
app.use('/', ruoke);
const port = process.env.PORT || 80;

const server = app.listen(port, () => console.log("RUNNING IN PORT", port));