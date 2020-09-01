import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './_synopsis-reports-list.scss';

const mapStateToProps = state => ({
  srData: state.synopsisReportList,
});

function SynopsisReportsList(props) {
  if (!props.srData) return null;

  return (
    <React.Fragment>
      <h3 className="heading">Most Recent Synopsis Reports</h3>
      { props.srData.length
        ? <table className="reports-list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Check in Date</th>
              <th>SR Status</th>
              <th>Point Sheet Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              props.srData
                ? props.srData.map((sr, i) => {
                  return <tr key={i}>
                      <td>{sr.srName}</td>
                      <td>{sr.title}</td>
                      <td>{sr.synopsisReportStatus}</td>
                      <td>{sr.pointSheetStatus}</td>
                      <td><button className="btn-link-1" 
                        onClick={sr.pointSheetStatus && sr.pointSheetStatus.toLowerCase() === 'virtual' ? props.onSummerClick : props.onClick} 
                        value={sr.id} 
                        name="SynopsisReportsTable">EDIT</button></td>
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

SynopsisReportsList.propTypes = {
  onClick: PropTypes.func,
  onSummerClick: PropTypes.func,
  srData: PropTypes.array,
};

export default connect(mapStateToProps)(SynopsisReportsList);
