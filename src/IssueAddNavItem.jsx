import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import { withRouter } from 'react-router'; // eslint-disable-line
import { TextField, RaisedButton, FontIcon, Dialog, Snackbar } from 'material-ui';
import AutoComplete from 'material-ui/AutoComplete';
import SigninNavItem from './SigninNavItem.jsx';

class IssueAddNavItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showing: false,
            searchIssues: [],
            snackbar: {
                open: false,
                text: ''
            }
        };

        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.submit = this.submit.bind(this);
        this.searchIssues = this.searchIssues.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
        this.selectIssue = this.selectIssue.bind(this);
    }

    showModal() {
        this.setState({ showing: true });
    }
    hideModal() {
        this.setState({ showing: false });
    }

    handleIssueUpdate(value){
        const snackbar = {
            open: true,
            text: value
        };
        this.setState({ snackbar });
    };

    submit(e) {
        e.preventDefault();
        this.hideModal();
        const form = document.forms.IssueAddNav;
        const newIssue = {
            owner: form.owner.value, title: form.title.value,
            status: 'New', created: new Date(),
        };
        fetch('/api/issues', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newIssue),
        }).then(response => {
            if (response.ok) {
                response.json().then(updatedIssue => {
                    this.props.router.push(`/issues/${updatedIssue._id}`);
                });
            } else {
                response.json().then(error => {
                    this.handleIssueUpdate(`Failed to add issue: ${error.message}`);
                });
            }
        }).catch(err => {
            this.handleIssueUpdate(`Error in sending data to server: ${err.message}`);
        });
    }

    searchIssues(input) {
    if (input.length < 2) return Promise.resolve({ options: [] });
    return fetch(`/api/issues?search=${input}`).then(response => {
        if (!response.ok) return response.json().then(error => Promise.
        reject(error));
        return response.json().then(data => {
            const options = data.records.map(issue => ({
                value: issue._id,
                text: `${issue._id.substr(-4)}: ${issue.title}`,
            }));

            this.setState({
                searchIssues: options
            });
            return { options };
        }).catch(error => {
            alert(`Error fetching data from server: ${error}`);
        });
    });
}
    filterOptions(options) {
    return options;
}
    selectIssue(item) {
    if (item) this.props.router.push(`/issues/${item.value}`);
    }

    render() {
        const textfieldStyle = {
            marginRight: 10
        };

        const iconStyles = {
            marginRight: 24,
            marginTop: 5,
            color: '#fff',
            cursor: 'pointer'
        };

        console.log(this.props);
        return (
            <div>
                <AutoComplete
                    hintText="Search"
                    filter={this.filterOptions}
                    dataSource={this.state.searchIssues}
                    onUpdateInput={this.searchIssues}
                    onNewRequest = {this.selectIssue}
                />

                {this.props.user.signedIn ? (<FontIcon className="material-icons" onClick={this.showModal} style={iconStyles} > add_alert </FontIcon>) : null}
                <Dialog
                    title="Add Issue"
                    modal={true}
                    open={this.state.showing}
                >
                    <form name="IssueAddNav" onSubmit={this.submit}>
                        <TextField
                            name="owner"
                            floatingLabelText="Owner"
                            style={textfieldStyle}
                            fullWidth={true}
                            required
                        />
                        <br />
                        <TextField
                            name="title"
                            floatingLabelText="Title"
                            style={textfieldStyle}
                            fullWidth={true}
                            required
                        />
                        <br />
                        <RaisedButton label="Add" primary={true} type="submit"  />
                        &nbsp;
                        <RaisedButton label="Close" onClick={this.hideModal}  />
                    </form>
                </Dialog>
                <SigninNavItem
                    user={this.props.user} onSignin={this.props.onSignin}
                    onSignout={this.props.onSignout}
                    showError={this.handleIssueUpdate} showSuccess={this.handleIssueUpdate}
                />
            </div>

        );
    }
}

IssueAddNavItem.propTypes = {
    router: React.PropTypes.object,
    onSignin: React.PropTypes.func.isRequired,
    onSignout: React.PropTypes.func.isRequired,
    user: React.PropTypes.object,
};
export default withRouter(IssueAddNavItem);
