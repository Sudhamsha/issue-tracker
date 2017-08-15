
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import 'babel-polyfill';
import SourceMapSupport from 'source-map-support';
import Issue from './issue';
import path from 'path';

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

// Get Issues
app.get('/api/issues', (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.effort_lte || req.query.effort_gte) {
    filter.effort = {};
  }

  if (req.query.effort_lte) {
    filter.effort.$lte = parseInt(req.query.effort_lte, 10);
  }

  if (req.query.effort_gte) {
    filter.effort.$gte = parseInt(req.query.effort_gte, 10);
  }

  if(req.query._summary === undefined) {
      let limit = req.query.limit ? parseInt(req.query._limit, 10) : 20;
      if (limit > 50) limit = 50;

      db.collection('issues').find(filter)
          .limit(limit)
          .toArray().then((issues) => {
          const metadata = { total_count: issues.length };
          res.json({ _metadata: metadata, records: issues });
      })
          .catch((error) => {
              console.log('ERROR', error);
              res.status(500).json({ message: `Internal Server Error: ${error}` });
          });
  }
  else {
    db.collection('issues').aggregate([
        { $match: filter },
        { $group: { _id: { owner: '$owner', status: '$status' }, count: {
        $sum: 1 } } },
        ]).toArray()
        .then(results => {
            const stats = {};
            results.forEach(result => {
                if (!stats[result._id.owner]) stats[result._id.owner] = {};
                stats[result._id.owner][result._id.status] = result.count;
            });
            res.json(stats);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ message: `Internal Server Error: ${error}` });
        });
  }

});

// Get Single Issue
app.get('/api/issues/:id', (req, res) => {
  let issueId;
  try {
    const ObjectId = require('mongodb').ObjectID;
    issueId = ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid issue ID format: ${error}` });
    return;
  }
  db.collection('issues').find({ _id: issueId }).limit(1)
    .next()
    .then(issue => {
      if (!issue) res.status(404).json({ message: `No issue found with ID: ${issueId}` });
      else res.json(issue);
    })
    .catch(error => {
      res.status(500).json({ message: `Internal Server Error: ${error}`});
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

// Update Issue
app.put('/api/issues/:id', (req, res) => {
  let issueId;
  try {
    const ObjectId = require('mongodb').ObjectID;
    issueId = ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid issue ID format: ${error}` });
    return;
  }

  const issue = req.body;
  delete issue._id;

  const err = Issue.validateIssue(issue);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
  }
  db.collection('issues').update({ _id: issueId },
    Issue.convertIssue(issue)).then(() =>
    db.collection('issues').find({ _id: issueId }).limit(1)
      .next()
  )
    .then(savedIssue => {
      res.json(savedIssue);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
});

app.delete('/api/issues/:id', (req, res) => {
  let issueId;
  try {
    const ObjectId = require('mongodb').ObjectID;
    issueId = ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid issue ID format: ${error}` });
    return;
  }

  db.collection('issues').deleteOne({ _id: issueId }).then((deleteRequest) => {
    if (deleteRequest.result.n === 1) res.json({ status: 'OK' });
    else res.json({ status: 'Warning: object not found' });
  })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});
