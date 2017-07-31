import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, hashHistory } from 'react-router';

import IssueList from './IssueList.jsx'; // eslint-disable-line
import IssueEdit from './IssueEdit.jsx'; // eslint-disable-line

const contentNode = document.getElementById('contents');
const NoMatch = () => <p> Page not found</p>;

const RoutedApp = () => (
  <Router history={hashHistory} >
    <Redirect path="/" to="/issues" />
    <Route path="/issues" component={IssueList} />
    <Route path="/issues/:id" component={IssueEdit} />
    <Route path="*" component={NoMatch} />
  </Router>
);

ReactDOM.render(<RoutedApp />, contentNode);

if (module.hot) {
  module.hot.accept();
}
