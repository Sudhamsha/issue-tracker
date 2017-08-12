import React from 'react';
import 'whatwg-fetch';
import { Link } from 'react-router';
import { Divider, IconButton, FontIcon, Snackbar } from 'material-ui';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [], snackbar: {
        open: false,
        text: ''
    } };
    this.createIssue = this.createIssue.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }
  componentDidUpdate(prevProps) {
    const oldQuery = prevProps.location.query;
    const newQuery = this.props.location.query;

    if (oldQuery.status === newQuery.status
        && oldQuery.effort_gte === newQuery.effort_gte
        && oldQuery.effort_lte === newQuery.effort_lte) {
      return;
    }
    this.loadData();
  }
  setFilter(query) {
      console.log(query);
    this.props.router.push({ pathname: this.props.location.pathname, query });
  }

    showSnackbar(value){
        const snackbar = {
            open: true,
            text: value
        };

        this.setState({ snackbar });
    };

  loadData() {
    fetch(`/api/issues${this.props.location.search}`).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log(`Records Returned: ${data._metadata.total_count}`);
          data.records.forEach((issue) => {
            issue.created = new Date(issue.created);
            if (issue.completionDate) {
              issue.completionDate = new Date(issue.completionDate);
            }
          });
          this.setState({ issues: data.records });
        });
      } else {
        response.json().then((error) => {
          this.showSnackbar(`Failed to fetch issues: ${error.message}`);
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  createIssue(newIssue) {
    fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIssue),
    }).then((response) => {
      if (response.ok) {
        response.json().then((updatedIssue) => {
          updatedIssue.created = new Date(updatedIssue.created);
          if (updatedIssue.completionDate) {
            updatedIssue.completionDate = new Date(updatedIssue.completionDate);
          }
          const newIssues = this.state.issues.concat(updatedIssue);
          this.setState({ issues: newIssues });
          this.showSnackbar('Issue Added');

        });
      } else {
        response.json().then((error) => {
          this.showSnackbar(`Failed to add issue: ${error.message}`);
        });
      }
    }).catch((err) => {
      console.log(`Error posting the data: ${err.message}`);
    });
  }

  deleteIssue(id) {
    fetch(`/api/issues/${id}`, { method: 'DELETE' }).then(response => {
      if (!response.ok) {
          this.showSnackbar('Cannot delete the issue');
      } else {
          this.showSnackbar('Issue deleted');
          this.loadData();
      }
    });
  }

  render() {
    const dividerStyle = {
      marginTop: 10,
      marginBottom: 10
    };

    return (
      <div>
        <IssueFilter setFilter={this.setFilter} initFilter={this.props.location.query} />
        <Divider style={dividerStyle}/>
        <IssueTable issues={this.state.issues} deleteIssue={this.deleteIssue} />
        <Divider style={dividerStyle} />
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.text}
          autoHideDuration={4000}
      />
      </div>
    );
  }
}

import IssueAdd from './IssueAdd.jsx';
import IssueFilter from './IssueFilter.jsx';

const IssueRow = (props) => {
  function onDeleteClick() {
    props.deleteIssue(props.issue._id);
  }
  return (
      <TableRow>
      <TableRowColumn><Link to={`issues/${props.issue._id}`}>
        {props.issue._id.substr(-4)}
      </Link></TableRowColumn>
      <TableRowColumn>{props.issue.status}</TableRowColumn>
      <TableRowColumn>{props.issue.owner}</TableRowColumn>
      <TableRowColumn>{props.issue.created.toDateString()}</TableRowColumn>
      <TableRowColumn>{props.issue.effort}</TableRowColumn>
      <TableRowColumn>{props.issue.completionDate ? props.issue.completionDate.toDateString() : ''}</TableRowColumn>
      <TableRowColumn>{props.issue.title}</TableRowColumn>
      <TableRowColumn>
        <IconButton onClick={onDeleteClick}>
          <FontIcon className="material-icons">delete</FontIcon>
        </IconButton>
      </TableRowColumn>
      </TableRow>
);
}

function IssueTable(props) {
  const borderedStyle = { border: '1px solid silver', padding: 4 };
  const issueRows = props.issues.map(issue => <IssueRow key={issue._id} issue={issue} deleteIssue={props.deleteIssue} />);
  return (
      <Table>
        <TableHeader displaySelectAll={false}>
          <TableRow>
          <TableHeaderColumn>ID</TableHeaderColumn>
          <TableHeaderColumn>Status</TableHeaderColumn>
          <TableHeaderColumn>Owner</TableHeaderColumn>
          <TableHeaderColumn>Created</TableHeaderColumn>
          <TableHeaderColumn>Effort</TableHeaderColumn>
          <TableHeaderColumn>Completion Date</TableHeaderColumn>
          <TableHeaderColumn>Title</TableHeaderColumn>
          <TableHeaderColumn>Delete?</TableHeaderColumn>
          </TableRow>
        </TableHeader>
      <TableBody>
        {issueRows}
      </TableBody>
      </Table>

  );
}

IssueRow.defaultProps = {
  title: '-- no title --',
};

IssueList.propTypes = {
  location: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

IssueRow.propTypes = {
  issue: React.PropTypes.object.isRequired,
  deleteIssue: React.PropTypes.func.isRequired,
};

IssueTable.propTypes = {
  issues: React.PropTypes.array.isRequired,
  deleteIssue: React.PropTypes.func.isRequired,
};
