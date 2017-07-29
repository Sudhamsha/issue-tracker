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
      return `${f} is required.`;
    }
  }
   if (!validIssueStatus[issue.status]){
     return `${issue.status} is not a valid status.`;
   }
  return null;
}

export default {
  validateIssue: validateIssue
}
