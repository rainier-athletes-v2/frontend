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
      <h3 className="heading">Most Recent Synopsis { props.srData.length > 1 ? 'Reports' : 'Report' }</h3>
      { props.srData.length
        ? <table className="reports-list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Check in Date</th>
              <th>SR Status</th>
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
                      <td><button className={sr.synopsisReportStatus !== 'Completed' ? 'btn-link-1' : 'btn-link-1 greyedout'}
                        onClick={sr.pointSheetStatus && sr.pointSheetStatus.toLowerCase() === 'virtual' ? props.onSummerClick : props.onClick} 
                        value={sr.id} 
                        name="SynopsisReportsTable"
                        disabled={sr.synopsisReportStatus === 'Completed'}>FILL IN</button>
                      </td>
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
