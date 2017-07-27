const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb://localhost/issuetracker').then(connection => {
  db = connection;
  app.listen(8000, () => {
    console.log('App started on 8000');
  });
}).catch(error => {
  console.log('ERROR', error);
});

// Issue Validation
const validIssueStatus = {
  New: true,
  Open: true,
  Assigned: true,
  Fixed: true
};

const issueFieldType = {
  status: 'required',
  owner: 'required',
  effort: 'optional',
  created: 'required',
  completionDate: 'optional',
  title: 'required'
};

function validateIssue(issue){
  for (const f in issueFieldType){
    const type = issueFieldType[f];
    if(!type) {
      delete issue[f];
    } else if( type === 'required' && !issue[f]){
      return `${issue.status} is not a valid status.`;
    }
  }
}

// Get Issue
app.get('/api/issues', (req, res) => {
  db.collection('issues').find().toArray().then(issues => {
    const metadata = {total_count: issues.length};
    res.json({ _metadata: metadata, records: issues });
  }).catch(error => {
    console.log('ERROR', error);
    res.status(500).json({message: `Internal Server Error: ${error}`})
  });
});

// Post Issue
app.post('/api/issues', (req, res) => {
  const newIssue = req.body;
  newIssue.created = new Date();
  if(!newIssue.status){
    newIssue.status = 'New';
  }

  const err = validateIssue(newIssue);
  if(err){
    res.status(422).json({message: `Invalid request: ${err}`});
    return;
  }

  db.collection('issues').insertOne(newIssue).then(result =>
    db.collection('issues').find({_id: result.insertedId}).limit(1).next()
  ).then(newIssue => {
    res.json(newIssue);
  }).catch(error => {
    console.log('ERROR', error);
    res.status(500).json({ message: `Internal Server Error: ${error}`});
  });
});
