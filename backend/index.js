const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hi there',
  });
});

const port = process.env.PORT || 6789;

app.listen(port, () => {
  console.log(`Living on http://localhost:${port}`);
});
