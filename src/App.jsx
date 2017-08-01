import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, hashHistory, withRouter } from 'react-router';

import IssueList from './IssueList.jsx'; // eslint-disable-line
import IssueEdit from './IssueEdit.jsx'; // eslint-disable-line

const contentNode = document.getElementById('contents');
const NoMatch = () => <p> Page not found</p>;

const App = (props) => (
  <div>
    <div className="header">
      <h1>Issue Tracker</h1>
    </div>
    <div className="contents">
      {props.children}
    </div>
    <div className="footer">
      Full source code available at this <a href="https://github.com/sudhamsha/issue-tracker"> GitHub repository</a>.
    </div>
  </div>
);

const RoutedApp = () => (
  <Router history={hashHistory} >
    <Redirect path="/" to="/issues" />
    <Route path="/" component={App}>
      <Route path="/issues" component={withRouter(IssueList)} />
      <Route path="/issues/:id" component={IssueEdit} />
      <Route path="*" component={NoMatch} />
    </Route>
  </Router>
);

ReactDOM.render(<RoutedApp />, contentNode);

App.propTypes = {
  children: React.PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

if (module.hot) {
  module.hot.accept();
}
