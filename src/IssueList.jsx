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
import Pagination from 'material-ui-pagination';

const PAGE_SIZE = 10;
export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [], snackbar: {
        open: false,
        text: ''
    }};
    this.createIssue = this.createIssue.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    this.setDisplay = this.setDisplay.bind(this);
    this.selectPage = this.selectPage.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }
  componentDidUpdate(prevProps) {
    const oldQuery = prevProps.location.query;
    const newQuery = this.props.location.query;
    if (oldQuery.status === newQuery.status
        && oldQuery.effort_gte === newQuery.effort_gte
        && oldQuery.effort_lte === newQuery.effort_lte
        && oldQuery._page === newQuery._page
    ) {
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
      const query = Object.assign({}, this.props.location.query);
      const pageStr = query._page;
      if (pageStr) {
          delete query._page;
          query._offset = (parseInt(pageStr, 10) - 1) * PAGE_SIZE;
      }
      query._limit = PAGE_SIZE;
      const search = Object.keys(query).map(k => `${k}=${query[k]}`).join('&');

    fetch(`/api/issues?${search}`).then((response) => {

      if (response.ok) {
        response.json().then((data) => {
          console.log(`Records Returned: ${data.metadata.totalCount}`);
          data.records.forEach((issue) => {
            issue.created = new Date(issue.created);
            if (issue.completionDate) {
              issue.completionDate = new Date(issue.completionDate);
            }
          });
          this.setState({ issues: data.records, totalCount: data.metadata.totalCount, });
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

    setDisplay(event, display) {
        // eslint-disable-next-line no-param-reassign
        display = display.trim();
        if (display.match(/^\d*$/)) {
            if (display !== '') {
                // eslint-disable-next-line no-param-reassign
                display = parseInt(display, 10);
            } else {
                // eslint-disable-next-line no-param-reassign
                display = 0;
            }

            this.setState({ display });
        }
    }

    selectPage(eventKey) {
        const query = Object.assign(this.props.location.query,
 { _page: eventKey });
        this.props.router.push({ pathname: this.props.location.pathname,
 query });
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
          <Pagination
              total = {Math.ceil(this.state.totalCount / PAGE_SIZE)}
              current = {parseInt(this.props.location.query._page || '1', 10)}
              display = { PAGE_SIZE }
              onChange = { this.selectPage }
          />
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
      <div>
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
      </div>

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
