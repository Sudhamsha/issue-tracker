var contentNode = document.getElementById('contents');

const issues = [
    {
      id: 1,
      status: 'Open',
      owner: 'Ravan',
      created: new Date('2016-08-15'),
      effort: 5,
      completionDate: undefined,
      title: 'Error in console when clicking Add',
    },
    {
      id: 2,
      tatus: 'Assigned',
      owner: 'Eddie',
      created: new Date('2016-08-16'),
      effort: 14,
      completionDate: new Date('2016-08-30'),
      title: 'Missing bottom border on panel',
    }
  ];

class IssueFilter extends React.Component {
  render() {
    return (
      <div>This a placeholder for issue filter. </div>
    )
  }
}

function IssueTable(props){
    const borderedStyle = {border: "1px solid silver", padding: 4};
    const issueRows = props.issues.map(issue => <IssueRow key={issue.id} issue={issue} />);
    return (
      <table className='bordered-table' style={{ borderCollapse: "collapse"}}>
        <thead>
          <tr>
            <th style={borderedStyle}>ID</th>
            <th style={borderedStyle}>Status</th>
            <th style={borderedStyle}>Owner</th>
            <th style={borderedStyle}>Created</th>
            <th style={borderedStyle}>Effort</th>
            <th style={borderedStyle}>Completion Date</th>
            <th style={borderedStyle}>Title</th>
          </tr>
        </thead>
        <tbody>
          {issueRows}
        </tbody>
      </table>
    );
}

class IssueAdd extends React.Component {
  constructor(){
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e){
    e.preventDefault();

    var form = document.forms.IssueAdd;
    this.props.createIssue({
      owner: form.owner.value,
      title: form.title.value,
      status: 'New',
      created: new Date()
    });

    form.owner.value = "";
    form.title.value = "";
  }

  render() {
    return (
      <div>
        <form name="IssueAdd" onSubmit={this.handleSubmit}>
          <input type="text" name="owner" placeholder="Owner" />
          <input type="text" name="title" placeholder="Title" />
          <button>Add</button>
        </form>
      </div>
    )
  }
}

const IssueRow = (props) => (
      <tr>
        <td>{props.issue.id}</td>
        <td>{props.issue.status}</td>
        <td>{props.issue.owner}</td>
        <td>{props.issue.created.toDateString()}</td>
        <td>{props.issue.effort}</td>
        <td>{props.issue.completionDate? props.issue.completionDate.toDateString() : ''}</td>
        <td>{props.issue.title}</td>
      </tr>
)

class IssueList extends React.Component {
  constructor(){
    super();
    this.state = {issues: []};
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount(){
    this.loadData();
  }

  loadData(){
    setTimeout(() => {
      this.setState({issues: issues});
    }, 500);
  }

  createIssue(newIssue){
    const newIssues = this.state.issues.slice();
    newIssue.id = this.state.issues.length + 1;
    newIssues.push(newIssue);
    this.setState({ issues: newIssues });
  }

  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr/>
        <IssueTable issues={this.state.issues}/>
        <hr/>
        <IssueAdd createIssue={this.createIssue}/>
      </div>
    )
  }
}

IssueRow.defaultProps = {
  title: '-- no title --',
};


ReactDOM.render(<IssueList/>, contentNode);
