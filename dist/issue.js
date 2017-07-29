'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Issue Validation
var validIssueStatus = {
  New: true,
  Open: true,
  Assigned: true,
  Fixed: true
};

var issueFieldType = {
  status: 'required',
  owner: 'required',
  effort: 'optional',
  created: 'required',
  completionDate: 'optional',
  title: 'required'
};

function validateIssue(issue) {
  for (var f in issueFieldType) {
    var type = issueFieldType[f];
    if (!type) {
      delete issue[f];
    } else if (type === 'required' && !issue[f]) {
      return f + ' is required.';
    }
  }
  if (!validIssueStatus[issue.status]) {
    return issue.status + ' is not a valid status.';
  }
  return null;
}

exports.default = {
  validateIssue: validateIssue
};
//# sourceMappingURL=issue.js.map