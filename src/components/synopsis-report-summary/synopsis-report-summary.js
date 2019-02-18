import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as pl from '../../lib/pick-list-tests';
import './synopsis-report-summary.scss';

const mapStateToProps = state => ({
  synopsisLink: state.synopsisReportLink,
});

class SynopsisReportSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleCopy = () => {
    const range = document.getSelection().getRangeAt(0);
    range.selectNode(document.getElementById('body'));
    window.getSelection().addRange(range);
    document.execCommand('copy');
  }

  render() {
    const tooltip = (
      <Tooltip id="tooltip">
        Don&#39;t forget to paste into Basecamp!
      </Tooltip>
    );
    
    if (!this.props.synopsisReport) return null;

    const { synopsisReport } = this.props;
    const playingTimeOnly = pl.playingTimeOnly(synopsisReport.Synopsis_Report_Status__c);

    const playingTimeOnlyResponseJSX = (
      <React.Fragment>
        <p>Thank you for submitting your mentee&#39;s playing time.</p>
        <p>Please remember to complete their full report by Sunday Evening</p>
      </React.Fragment>
    );

    const fullReportResponseJSX = (
      <React.Fragment>
        <h4>{synopsisReport.Week__c}</h4>
        {/* <br /> */}
        { pl.turnedIn(synopsisReport.Point_Sheet_Status__c) ? null
          : <React.Fragment>
            <p>Point Sheet not turned in.</p>
            </React.Fragment> }
        { pl.turnedIn(synopsisReport.Point_Sheet_Status__c) 
          && (synopsisReport.Mentor_Granted_Playing_Time__c === '' || synopsisReport.Mentor_Granted_Playing_Time__c === synopsisReport.Earned_Playing_Time__c)
          ? <React.Fragment>
            <span className="title">
            Game Eligibility Earned
            </span>
            <span> {synopsisReport.Earned_Playing_Time__c}</span>
          </React.Fragment>
          : <React.Fragment>
            <span className="title">Mentor Granted Playing Time</span>
            <span>{synopsisReport.Mentor_Granted_Playing_Time__c}</span>
            <br />
            <span className="title">Mentor Comments</span>
            <p>{synopsisReport.Mentor_Granted_Playing_Time_Explanation__c}</p>
            <br /> 
            </React.Fragment> }
            {synopsisReport.Student_Action_Items__c
              ? <React.Fragment>
                <br />
                <span className="title">Student Action Items</span>
                <p>{synopsisReport.Student_Action_Items__c}</p>
                </React.Fragment>
              : null
            }
            {synopsisReport.Sports_Update__c 
              ? <React.Fragment>
                <br />
                <span className="title">Sports Update</span>
                <p>{synopsisReport.Sports_Update__c}</p>
                </React.Fragment>
              : null
            }
            <br />
            Link To Full Synopsis Report (RA Points, Grades, Mentor Comments, etc): 
            <a href={this.props.synopsisLink} target="_blank" rel="noopener noreferrer"> CLICK HERE</a>
          </React.Fragment>
    );

    return (
      <div className="panel summary-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title title">{ playingTimeOnly ? 'Playing Time Saved' : 'Rainier Athletes Weekly Summary' }</h5>
              <button type="button" 
                className="close" 
                onClick={ this.props.onClose } 
                data-dismiss="modal" 
                aria-label="Close" 
                value={this.props.synopsisReport.id}
                name="SynopsisReportSummary">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body" id="body">
              { playingTimeOnly
                ? playingTimeOnlyResponseJSX
                : fullReportResponseJSX
              }
            </div>

            <div className="modal-footer">
              <OverlayTrigger placement="top" trigger="click" rootClose overlay={tooltip}>
                <button type="submit" className="btn btn-primary" onClick={this.handleCopy}>
                  <FontAwesomeIcon icon="copy" className="fa-1x copy"/>
                </button>
              </OverlayTrigger>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SynopsisReportSummary.propTypes = {
  synopsisReport: PropTypes.object,
  synopsisLink: PropTypes.string,
  onClose: PropTypes.func,
};

export default connect(mapStateToProps)(SynopsisReportSummary);
// export default SynopsisReportSummary;
