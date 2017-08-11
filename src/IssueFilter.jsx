import React from 'react';
import {SelectField, MenuItem, RaisedButton, Toolbar, ToolbarGroup, TextField} from 'material-ui';

export default class IssueFilter extends React.Component { // eslint-disable-line
  constructor(props) {
    super(props);
    this.state = {
      status: props.initFilter.status || '',
      effort_gte: props.initFilter.effort_gte || '',
      effort_lte: props.initFilter.effort_lte || '',
      changed: false,
    }

    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeEffortGte = this.onChangeEffortGte.bind(this);
    this.onChangeEffortLte = this.onChangeEffortLte.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      tatus: newProps.initFilter.status || '',
      effort_gte: newProps.initFilter.effort_gte || '',
      effort_lte: newProps.initFilter.effort_lte || '',
      changed: false,
    });
  }

  resetFilter(){
    this.setState({
      status: this.props.initFilter.status || '',
      effort_gte: this.props.initFilter.effort_gte || '',
      effort_lte: this.props.initFilter.effort_lte || '',
      changed: false,
    });
  }

  onChangeStatus(e, index, value) {
    this.setState({ status: value, changed: true });
  }

  onChangeEffortGte(e) {
    const effortString = e.target.value;
    if (effortString.match(/^\d*$/)) {
      this.setState({ effort_gte: e.target.value, changed: true });
    }
  }

  onChangeEffortLte(e) {
    const effortString = e.target.value;
    if (effortString.match(/^\d*$/)) {
      this.setState({ effort_lte: e.target.value, changed: true });
    }
  }

  applyFilter() {
    const newFilter = {};
    if (this.state.status) newFilter.status = this.state.status;
    if (this.state.effort_gte) newFilter.effort_gte = this.state.effort_gte;
    if (this.state.effort_lte) newFilter.effort_lte = this.state.effort_lte;
    this.props.setFilter(newFilter);
  }

  clearFilter(e) {
    e.preventDefault();
    this.props.setFilter({});
  }

  render() {
    const Separator = () => <span> | </span>;
    const toolbarButton = {
      margin: 5
    };

    const toolbarStyle = {
      padding: 40
    };

    return (
        <Toolbar style={toolbarStyle}>
          <ToolbarGroup>
            <SelectField
                floatingLabelText="Status"
                value={this.state.status ? this.state.status : null}
                onChange={this.onChangeStatus}
                autoWidth={true}

            >
              <MenuItem value=""  primaryText="(Any)" />
              <MenuItem value="New" primaryText="New" />
              <MenuItem value="Open" primaryText="Open" />
              <MenuItem value="Assigned" primaryText="Assigned" />
              <MenuItem value="Fixed" primaryText="Fixed" />
              <MenuItem value="Verified" primaryText="Verified" />
              <MenuItem value="Closed" primaryText="Closed" />
            </SelectField>
          </ToolbarGroup>
          <ToolbarGroup>
            <TextField floatingLabelText="Effort >=" size={5} value={this.state.effort_gte} onChange={this.onChangeEffortGte}/>
            <TextField floatingLabelText="Effort <=" size={5} value={this.state.effort_lte} onChange={this.onChangeEffortLte}/>
          </ToolbarGroup>
          <ToolbarGroup>
            <RaisedButton label="Apply" onClick={this.applyFilter} primary={true} style={toolbarButton}/>
            <RaisedButton label="Reset" onClick={this.resetFilter} disabled={!this.state.changed}  style={toolbarButton} />
            <RaisedButton label="Clear" onClick={this.clearFilter}  style={toolbarButton} />
          </ToolbarGroup>
        </Toolbar>
    );
  }
}

IssueFilter.propTypes = {
  setFilter: React.PropTypes.func.isRequired,
  initFilter: React.PropTypes.object.isRequired,
};
