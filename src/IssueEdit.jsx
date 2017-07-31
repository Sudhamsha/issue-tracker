import React from 'react';
import { Link } from 'react-router';

export default class IssueEdit extends React.Component
{ // eslint-disable-line
  render() {
    return (
      <div>
        This is a placeholder for edit page { this.props.params.id }
        <Link to="/issues">Back to issues</Link>
      </div>
    );
  }
}

IssueEdit.propTypes = {
  params: React.PropTypes.object.isRequired,
}
