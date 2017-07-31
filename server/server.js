
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import 'babel-polyfill';
import SourceMapSupport from 'source-map-support';
import Issue from './issue';

SourceMapSupport.install();

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack'); // eslint-disable-line
  const webpackDevMiddleware = require('webpack-dev-middleware'); // eslint-disable-line
  const webpackHotMiddleware = require('webpack-hot-middleware'); // eslint-disable-line

  const config = require('../webpack.config'); // eslint-disable-line
  config.entry.app.push('webpack-hot-middleware/client', 'webpack/hot/only-dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  const bundler = webpack(config);
  app.use(webpackDevMiddleware(bundler, { noInfo: true }));
  app.use(webpackHotMiddleware(bundler, { log: console.log }));
}

let db;
MongoClient.connect('mongodb://localhost/issuetracker').then((connection) => {
  db = connection;
  app.listen(8000, () => {
    console.log('App started on 8000');
  });
}).catch((error) => {
  console.log('ERROR', error);
});

// Get Issue
app.get('/api/issues', (req, res) => {
  db.collection('issues').find().toArray().then((issues) => {
    const metadata = { total_count: issues.length };
    res.json({ _metadata: metadata, records: issues });
  })
    .catch((error) => {
      console.log('ERROR', error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
});

// Post Issue
app.post('/api/issues', (req, res) => {
  const newIssue = req.body;
  newIssue.created = new Date();
  if (!newIssue.status) {
    newIssue.status = 'New';
  }

  const err = Issue.validateIssue(newIssue);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('issues').insertOne(Issue.cleanupIssue(newIssue)).then(result =>
    db.collection('issues').find({ _id: result.insertedId }).limit(1).next(),
  ).then((newIssue) => {
    res.json(newIssue);
  })
    .catch((error) => {
      console.log('ERROR', error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
});
