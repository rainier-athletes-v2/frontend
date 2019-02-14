import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = state => ({
  srData: state.synopsisReportList,
});

class SynopsisReportsTable extends React.Component {
  render() {
    if (!this.props.srData) return null;

    return (
      <React.Fragment>
        <h3>Most Recent Synopsis Reports</h3>
        { this.props.srData.length
          ? <table>
            <thead>
              <tr>
                <th>SF Name</th>
                <th>Report Dates</th>
                <th>SR Status</th>
                <th>Point Sheet Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                this.props.srData
                  ? this.props.srData.map((sr, i) => {
                    return <tr key={i}>
                        <td>{sr.srName}</td>
                        <td>{sr.title}</td>
                        <td>{sr.synopsisReportStatus}</td>
                        <td>{sr.pointSheetStatus}</td>
                        <td><button onClick={this.props.onClick} value={sr.id}>EDIT</button></td>
                      </tr>;
                  })
                  : null
              }
            </tbody>
            </table>
          : <p>There are no Synopsis Reports for this student</p> }
      </React.Fragment>
    );
  }
}

SynopsisReportsTable.propTypes = {
  onClick: PropTypes.func,
  srData: PropTypes.array,
};

export default connect(mapStateToProps)(SynopsisReportsTable);
