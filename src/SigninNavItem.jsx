import React from 'react';
import { TextField, RaisedButton, FontIcon, Dialog, Snackbar } from 'material-ui';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

export default class SigninNavItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showing: false, disabled: true,
        };
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.signout = this.signout.bind(this);
        this.signin = this.signin.bind(this);
    }

    componentDidMount() {
        window.gapi.load('auth2', () => {
            if (!window.gapi.auth2.getAuthInstance()) {
                if (!window.config || !window.config.googleClientId) {
                    this.props.showError('Missing Google Client ID or config file /static.config.js');
                } else {
                    window.gapi.auth2.init({ client_id: window.config.googleClientId }).then(() => {
                        this.setState({ disabled: false });
                    });
                }
            }
        });
    }

    signin() {
        this.hideModal();
        const auth2 = window.gapi.auth2.getAuthInstance();
        auth2.signIn().then(googleUser => {
            fetch('/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_token: googleUser.getAuthResponse().
 id_token }),
        }).then(response => {
                if (response.ok) {
                    response.json().then(user => {
                        this.props.onSignin(user.name);
                    });} else {
                    response.json().then(error => {
                        this.props.showError(`App login failed: ${error}`);
                    });
                }
            })
                .catch(err => {
                    this.props.showError(`Error posting login to app: ${err}`);
                });
        }, error => {
            this.props.showError(`Error authenticating with Google: ${error}`);
        });
    }
    signout() {
        const auth2 = window.gapi.auth2.getAuthInstance();
        fetch('/signout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            if (response.ok) {
                auth2.signOut().then(() => {
                    this.props.showSuccess('Successfully signed out.');
                    this.props.onSignout();
                });
            }
        });
    }

    showModal() {
        if (this.state.disabled) {
            console.log('Missing Google Client ID or config file /static.config.js');
        } else {
            this.setState({ showing: true });
        }
    }

    hideModal() {
        this.setState({ showing: false });
    }

    render() {
        if (this.props.user.signedIn) {
            return (
                <IconMenu
                    {...this.props}
                    iconButtonElement={
                    <IconButton><MoreVertIcon /></IconButton>
                }
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                >
                    <MenuItem primaryText={this.props.user.name} />
                <MenuItem onClick={this.signout}>Sign out</MenuItem>
                </IconMenu>
            );
        }
        const iconStyles = {
            marginRight: 24,
            marginTop: 5,
            color: '#fff',
            cursor: 'pointer'
        };
        return (
            <span>
            <FontIcon className="material-icons" onClick={this.showModal} style={iconStyles}> account_circle </FontIcon>
                <Dialog
                    title="Sign-in"
                    modal={true}
                    open={this.state.showing}
                >
                    <RaisedButton label="Sign In" disabled={this.state.disabled} onClick={this.signin} primary={true} type="submit"  />
                        &nbsp;
                    <RaisedButton label="Close" onClick={this.hideModal}  />
                </Dialog>
            </span>

        );
    }
}

SigninNavItem.propTypes = {
    user: React.PropTypes.object,
    onSignin: React.PropTypes.func.isRequired,
    onSignout: React.PropTypes.func.isRequired,
};