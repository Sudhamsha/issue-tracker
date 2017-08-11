import React from 'react';
import { TextField, RaisedButton, FontIcon } from 'material-ui';

export default class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    const form = document.forms.IssueAdd;
    this.props.createIssue({
      owner: form.owner.value,
      title: form.title.value,
      status: 'New',
      created: new Date(),
    });

    form.owner.value = '';
    form.title.value = '';
  }

  render() {
    const textfieldStyle = {
      marginRight: 10
    };

    return (
      <div>
        <form name="IssueAdd" onSubmit={this.handleSubmit}>
          <TextField
              name="owner"
              floatingLabelText="Owner"
              style={textfieldStyle}
          />
          <TextField
              name="title"
              floatingLabelText="Title"
              style={textfieldStyle}
          />

          <RaisedButton label="Add" type="submit"  />
        </form>
      </div>
    );
  }
}
