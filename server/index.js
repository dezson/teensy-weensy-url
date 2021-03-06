const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const { nanoid } = require('nanoid');

require('dotenv').config();

const db = monk(process.env.MONGO_DB_URI);
const urls = db.get('urls');

// Db will raise an error in case of collision
urls.createIndex({ shortUrl: 1 }, { unique: true });

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

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

app.get('/:id', async (req, res) => {
  const { id: shortUrl } = req.params;
  try {
    const record = await urls.findOne({ shortUrl });
    if (record) {
      res.redirect(record.url);
    }
    res.redirect('/?error=${shortUrl} not found');
  } catch (error) {
    res.redirect('/?error=URL found');
  }
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
    console.log(`Orig Url :${url}`);
    console.log(`Short Url :${shortUrl}`);
    const newUrl = {
      url,
      shortUrl,
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith('E11000')) {
      error.message = 'Short URL in use.';
    }
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
