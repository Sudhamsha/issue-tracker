import React from 'react';
import 'whatwg-fetch';
import { Link } from 'react-router'; // eslint-disable-line
import { Paper, Subheader, TextField, SelectField, MenuItem, RaisedButton, FlatButton, DatePicker, Snackbar } from 'material-ui';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';

export default class IssueEdit extends React.Component { // eslint-disable-line
  constructor() {
    super();
    this.state = {
      issue: {
        _id: '',
        title: '',
        status: '',
        owner: '',
        effort: null,
        completionDate: null,
        created: null,
      },
      invalidFields: {},
      snackbar: {
        open: false,
        text: ''
      }
    };

    this.onChange = this.onChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.id !== this.props.params.id) {
      this.loadData();
    }
  }

  onValidityChange(event, valid) {
    const invalidFields = Object.assign({}, this.state.invalidFields);
    if (!valid) {
      invalidFields[event.target.name] = true;
    } else {
      delete invalidFields[event.target.name];
    }
    this.setState({ invalidFields });
  }

  handleIssueUpdate(value){
      const snackbar = {
          open: true,
          text: value
      };

      this.setState({ snackbar });
  };

  onChange(event, convertedValue) {
    const issue = Object.assign({}, this.state.issue);
    const value = (convertedValue !== undefined) ?
      convertedValue : event.target.value;
    issue[event.target.name] = value;
    this.setState({ issue });
  }

  onSelectChange(event, index, value) {
        const issue = Object.assign({}, this.state.issue);
        issue['status'] = value;
        this.setState({ issue });
    }

  onDateChange(event, convertedValue) {
        const issue = Object.assign({}, this.state.issue);
        const value = convertedValue;
        issue['completionDate'] = value;
        this.setState({ issue });
    }

  onSubmit(event) {
    event.preventDefault();
    if (Object.keys(this.state.invalidFields).length !== 0) {
      return;
    }

    fetch(`/api/issues/${this.props.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.issue),
    }).then(response => {
      if (response.ok) {
        response.json().then(updatedIssue => {
          updatedIssue.created = new Date(updatedIssue.created);
          if (updatedIssue.completionDate) {
            updatedIssue.completionDate = new Date(updatedIssue.
              completionDate);
          }
          this.setState({ issue: updatedIssue });
          this.handleIssueUpdate('Updated Issue');
        });
      } else {
        response.json().then(error => {
          this.handleIssueUpdate(`Failed to update issue: ${error.message}`);
        });
      }
    }).catch(err => {
      this.handleIssueUpdate(`Error in sending data to server: ${err.message}`);
    });
  }

  loadData() {
    fetch(`/api/issues/${this.props.params.id}`).then(response => {
      if (response.ok) {
        response.json().then(issue => {
          issue.created = new Date(issue.created);
          issue.completionDate = issue.completionDate != null ?
            new Date(issue.completionDate) : null;
          this.setState({ issue });
        });
      } else {
        response.json().then(error => {
          this.handleIssueUpdate(`Failed to fetch issue: ${error.message}`);
        });
      }
    }).catch(err => {
      this.handleIssueUpdate(`Failed to fetch data from server: ${err.message}`);
    });
  }

  render() {
    const issue = this.state.issue;
      const paperStyle = {
          marginTop: 20,
          padding: 20,
      };
      const subHeader = {
        padding: 0
      };

      const backButton = {
          marginTop: 20,
        marginLeft: 10
      };

    const validationMessage = Object.keys(this.state.invalidFields).
      length === 0 ? null
      : (<div className="error">Invalid Fields</div>);
    return (
        <form onSubmit={this.onSubmit}>
          <Subheader style={subHeader}>Edit Issue</Subheader>
          <TextField
              disabled={true}
              hintText="ID"
              value={issue._id}
              floatingLabelText="ID"
              fullWidth={true}
          /><br />
          <TextField
              disabled={true}
              hintText="Created"
              value={issue.created ? issue.created.toDateString() : ''}
              floatingLabelText="Created"
              fullWidth={true}
          /><br />

          <SelectField
              floatingLabelText="Status"
              name="status"
              value={issue.status}
              onChange={this.onSelectChange}
              fullWidth={true}

          >
            <MenuItem value=""  primaryText="(Any)" />
            <MenuItem value="New" primaryText="New" />
            <MenuItem value="Open" primaryText="Open" />
            <MenuItem value="Assigned" primaryText="Assigned" />
            <MenuItem value="Fixed" primaryText="Fixed" />
            <MenuItem value="Verified" primaryText="Verified" />
            <MenuItem value="Closed" primaryText="Closed" />
          </SelectField>
          <br />
          <TextField
              name="owner"
              floatingLabelText="Owner"
              value={issue.owner}
              onChange={this.onChange}
              fullWidth={true}
          />
          <br />
          <TextField
              name="effort"
              floatingLabelText="Effort"
              value={issue.effort ? issue.effort: ''}
              onChange={this.onChange}
              fullWidth={true}
          />
          <br />
          <DatePicker
              name="completionDate"
              hintText="Completion Date"
              container="inline"
              value={issue.completionDate}
              onChange={this.onDateChange}
              fullWidth={true}
          />
          <br />
          <TextField
              name="title"
              floatingLabelText="Title"
              value={issue.title}
              onChange={this.onChange}
              fullWidth={true}
          />
          <br />
            {validationMessage}
          <RaisedButton type="submit" primary={true} label="Submit"/>

          <FlatButton label="Back" primary={true} style={backButton} containerElement={<Link to="/issues">Back</Link>} />
          <Snackbar
              open={this.state.snackbar.open}
              message={this.state.snackbar.text}
              autoHideDuration={4000}
          />
        </form>
    );
  }
}

IssueEdit.propTypes = {
  params: React.PropTypes.object.isRequired,
};
