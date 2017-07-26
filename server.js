const express = require('express');

const app = express();
app.use(express.static('public'));

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

// Get API Method
app.get('/api/issues', (req, res) => {
  const metadata = {total_count: issues.length};
  res.json({ _metadata: metadata, records: issues });
});

app.listen(8000, () => {
  console.log('App started on 8000');
});
