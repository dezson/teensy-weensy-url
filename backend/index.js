const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const { nanoid } = require('nanoid');

require('dotenv').config();

const db = monk(process.env.MONGO_DB_URI);
const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

const schema = yup.object().shape({
  shortUrl: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.get('/', (req, res) => {
  res.json({
    message: 'Hi there',
  });
});

app.get('/:id', (req, res) => {
  //TODO: redirect
});

app.post('/url', async (req, res, next) => {
  let { shortUrl, url } = req.body;
  try {
    await schema.validate({
      shortUrl,
      url,
    });
    if (!shortUrl) {
      shortUrl = nanoid(5);
    }
    res.json({
      shortUrl,
      url,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/url/:id', (req, res) => {
  //TODO: get a short url by id
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV == 'production' ? '🥞' : error.stack,
  });
});

const port = process.env.PORT || 6789;

app.listen(port, () => {
  console.log(`Living on http://localhost:${port}`);
});
