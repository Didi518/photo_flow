const DataUriParser = require('datauri/parser');

const path = require('node:path');

const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extname = path.extname(file.originalname).toString();

  return parser.format(extname, file.buffer).content;
};

module.exports = getDataUri;
