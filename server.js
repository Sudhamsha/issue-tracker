const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// Static list of issues
const issues = [
    {
      id: 1,
      status: 'Open',
      owner: 'Ravan',
      created: new Date('2016-08-15'),
      effort: 5,
      completionDate: undefined,
      title: 'Error in console when clicking Add',
    },
    {
      id: 2,
      tatus: 'Assigned',
      owner: 'Eddie',
      created: new Date('2016-08-16'),
      effort: 14,
      completionDate: new Date('2016-08-30'),
      title: 'Missing bottom border on panel',
    }
  ];

// Issue Validation
const validIssueStatus = {
  New: true,
  Open: true,
  Assigned: true,
  Fixed: true
};

const issueFieldType = {
  id: 'required',
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
  const metadata = {total_count: issues.length};
  res.json({ _metadata: metadata, records: issues });
});

// Post Issue
app.post('/api/issues', (req, res) => {
  const newIssue = req.body;
  newIssue.id = issues.length + 1;
  newIssue.created = new Date();
  if(!newIssue.status){
    newIssue.status = 'New';
  }

  const err = validateIssue(newIssue);
  if(err){
    res.status(422).json({message: `Invalid request: ${err}`});
    return;
  }
  issues.push(newIssue);
  res.json(newIssue);
});

app.listen(8000, () => {
  console.log('App started on 8000');
});
