'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongodb = require('mongodb');

require('babel-polyfill');

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

var _issue = require('./issue');

var _issue2 = _interopRequireDefault(_issue);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_sourceMapSupport2.default.install();

const app = (0, _express2.default)();
app.use(_express2.default.static('public'));
app.use(_bodyParser2.default.json());

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
_mongodb.MongoClient.connect('mongodb://localhost/issuetracker').then(connection => {
  db = connection;
  app.listen(8000, () => {
    console.log('App started on 8000');
  });
}).catch(error => {
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

  if (req.query.search) filter.$text = { $search: req.query.search };

  if (req.query._summary === undefined) {
    let limit = req.query._limit ? parseInt(req.query._limit, 10) : 20;
    const offset = req.query._offset ? parseInt(req.query._offset, 10) : 0;
    if (limit > 50) limit = 50;

    const cursor = db.collection('issues').find(filter).sort({ _id: 1 }).skip(offset).limit(limit);
    let totalCount;
    cursor.count(false).then(result => {
      totalCount = result;
      return cursor.toArray();
    }).then(issues => {
      res.json({ metadata: { totalCount }, records: issues });
    }).catch(error => {
      console.log('ERROR', error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
  } else {
    db.collection('issues').aggregate([{ $match: filter }, { $group: { _id: { owner: '$owner', status: '$status' }, count: {
          $sum: 1 } } }]).toArray().then(results => {
      const stats = {};
      results.forEach(result => {
        if (!stats[result._id.owner]) stats[result._id.owner] = {};
        stats[result._id.owner][result._id.status] = result.count;
      });
      res.json(stats);
    }).catch(error => {
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
  db.collection('issues').find({ _id: issueId }).limit(1).next().then(issue => {
    if (!issue) res.status(404).json({ message: `No issue found with ID: ${issueId}` });else res.json(issue);
  }).catch(error => {
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

  const err = _issue2.default.validateIssue(newIssue);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('issues').insertOne(_issue2.default.cleanupIssue(newIssue)).then(result => db.collection('issues').find({ _id: result.insertedId }).limit(1).next()).then(newIssue => {
    res.json(newIssue);
  }).catch(error => {
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

  const err = _issue2.default.validateIssue(issue);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
  }
  db.collection('issues').update({ _id: issueId }, _issue2.default.convertIssue(issue)).then(() => db.collection('issues').find({ _id: issueId }).limit(1).next()).then(savedIssue => {
    res.json(savedIssue);
  }).catch(error => {
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

  db.collection('issues').deleteOne({ _id: issueId }).then(deleteRequest => {
    if (deleteRequest.result.n === 1) res.json({ status: 'OK' });else res.json({ status: 'Warning: object not found' });
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.get('*', (req, res) => {
  res.sendFile(_path2.default.resolve('public/index.html'));
});
//# sourceMappingURL=server.js.map