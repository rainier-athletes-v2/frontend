import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = state => ({
  srData: state.synopsisReportList,
});

class SynopsisReportTable extends React.Component {
  render() {
    if (this.props.srData) {
      return (
      <React.Fragment>
        <h3>Most Recent Synopsis Reports</h3>
        <table>
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
      </React.Fragment>
      );
    }
    return null;
  }
}

SynopsisReportTable.propTypes = {
  onClick: PropTypes.func,
  srData: PropTypes.array,
};

export default connect(mapStateToProps)(SynopsisReportTable);
