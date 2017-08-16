import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Router, Route, Redirect, browserHistory, withRouter, Link } from 'react-router';
import {AppBar, Tabs, Tab, FontIcon, Paper} from 'material-ui';
injectTapEventPlugin();
import IssueList from './IssueList.jsx'; // eslint-disable-line
import IssueEdit from './IssueEdit.jsx'; // eslint-disable-line
import IssueAddNavItem from './IssueAddNavItem.jsx';
import IssueReport from './IssueReport.jsx';
import AutoComplete from 'material-ui/AutoComplete';

const contentNode = document.getElementById('contents');
const NoMatch = () => <p> 404 Page not found</p>;

const iconStyles = {
    marginRight: 24,
    marginTop: 5,
    color: '#fff'
};

const paperStyle = {
    marginTop: 20,
    padding: 10,
};

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: { signedIn: false, name: '' },
        };
        this.onSignin = this.onSignin.bind(this);
        this.onSignout = this.onSignout.bind(this);
    }

    onSignin(name) {
        this.setState({ user: { signedIn: true, name } });
    }
    onSignout() {
        this.setState({ user: { signedIn: false, name: '' } });
    }

    render() {
        const childrenWithUser = React.Children.map(this.props.children, child =>
            React.cloneElement(child, { user: this.state.user })
        );
        return  (

            <div>
                <AppBar
                    title={"Issue Tracker"}
                    iconElementRight={
                        <IssueAddNavItem user={this.state.user} onSignin={this.onSignin}
                        onSignout={this.onSignout} />
                    }
                >
                    <Tabs>
                        <Tab label="&nbsp;Issues&nbsp;" containerElement={<Link to="/issues"/>}/>
                        <Tab label="&nbsp;Reports &nbsp;" containerElement={<Link to="/reports"/>} />
                    </Tabs>
                </AppBar>
                <Paper style={paperStyle}>
                    {childrenWithUser}
                </Paper>
                <Paper style={paperStyle}>
                    Full source code available at this <a href="https://github.com/sudhamsha/issue-tracker"> GitHub repository</a>.
                </Paper>
            </div>
        );
    }
    }
;

const RoutedApp = () => (
    <MuiThemeProvider>
      <Router history={browserHistory} >
        <Redirect path="/" to="/issues" />
        <Route path="/" component={App}>
          <Route path="/issues" component={withRouter(IssueList)} />
          <Route path="/issues/:id" component={IssueEdit} />
          <Route path="reports" component={withRouter(IssueReport)} />
          <Route path="*" component={NoMatch} />
        </Route>
      </Router>
    </MuiThemeProvider>
);

ReactDOM.render(<RoutedApp />, contentNode);

App.propTypes = {
  children: React.PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  router: React.PropTypes.object,
};

if (module.hot) {
  module.hot.accept();
}
