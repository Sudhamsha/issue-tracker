import React from 'react';
import 'whatwg-fetch';
import { Link } from 'react-router';
import { Divider, IconButton, FontIcon, Snackbar } from 'material-ui';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';

import IssueFilter from './IssueFilter.jsx';

const statuses = ['New', 'Open', 'Assigned', 'Fixed', 'Verified', 'Closed'];

const StatRow = (props) => (
    <TableRow>
        <TableRowColumn>{props.owner}</TableRowColumn>
        {statuses.map((status, index) => (<TableRowColumn key={index}>{props.
            counts[status]}</TableRowColumn>))}
    </TableRow>
);

StatRow.propTypes = {
    owner: React.PropTypes.string.isRequired,
    counts: React.PropTypes.object.isRequired,
};

export default class IssueReport extends React.Component {
    constructor(props) {
        super(props);
        const stats = {};
        this.state = { stats: [], snackbar: {
            open: false,
            text: ''
        } };
        this.setFilter = this.setFilter.bind(this);
    }
    componentDidMount() {
        this.loadData();
    }
    componentDidUpdate(prevProps) {
        const oldQuery = prevProps.location.query;
        const newQuery = this.props.location.query;
        if (oldQuery.status === newQuery.status
            && oldQuery.effort_gte === newQuery.effort_gte
            && oldQuery.effort_lte === newQuery.effort_lte) {
            return;
        }
        this.loadData();
    }
    setFilter(query) {
        this.props.router.push({ pathname: this.props.location.pathname, query });
    }

    showSnackbar(value){
        const snackbar = {
            open: true,
            text: value
        };

        this.setState({ snackbar });
    };

    loadData() {
        fetch(`/api/issues?_summary${this.props.location.search}`)
            .then(response => {
                if (response.ok) {
                    response.json().then((data) => {
                        this.setState({ stats: data});
                    });
                } else {
                    response.json().then((error) => {
                        this.showSnackbar(`Failed to fetch summary: ${error.message}`);
                    });
                }
            }).catch(err => {
            this.showSnackbar(`Error in fetching data from server: ${err}`);
        });
    }
    render() {
        const dividerStyle = {
            marginTop: 10,
            marginBottom: 10
        };

        return (
        <div>
            <Table>
                <TableHeader displaySelectAll={false}>
                <TableRow>
                    <TableHeaderColumn></TableHeaderColumn>
                    {statuses.map((status, index) =><TableHeaderColumn key={index}>{status}</TableHeaderColumn>)}
                </TableRow>
                </TableHeader>
                <TableBody>
                {Object.keys(this.state.stats).map((owner, index) =>
                    <StatRow key={index} owner={owner}
                    counts={this.state.stats[owner]} />
                    )}
                </TableBody>
            </Table>
            <Snackbar
                open={this.state.snackbar.open}
                message={this.state.snackbar.text}
                autoHideDuration={4000}
            />
        </div>
    );
    }
}
IssueReport.propTypes = {
    location: React.PropTypes.object.isRequired,
    router: React.PropTypes.object,
};