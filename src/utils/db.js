const mongoose = require('mongoose');

/* istanbul ignore next */
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useNewUrlParser: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log('MongoDB connected');
});
