import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import { withRouter } from 'react-router'; // eslint-disable-line
import { TextField, RaisedButton, FontIcon, Dialog, Snackbar } from 'material-ui';

class IssueAddNavItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showing: false,
            snackbar: {
                open: false,
                text: ''
            }
        };

        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.submit = this.submit.bind(this);
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

        return (
            <div>
                <FontIcon className="material-icons" onClick={this.showModal} style={iconStyles}> add_alert </FontIcon>
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
            </div>

        );
    }
}

IssueAddNavItem.propTypes = {
    router: React.PropTypes.object,
};
export default withRouter(IssueAddNavItem);
