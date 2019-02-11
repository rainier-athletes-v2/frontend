import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './synopsis-report-summary.scss';

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

    const { synopsisReport } = this.props;
    const { playingTimeOnly } = synopsisReport;

    const playingTimeOnlyResponseJSX = (
      <React.Fragment>
        <p>Thank you for submitting your mentee&#39;s playing time.</p>
        <p>Please remember to complete their full report by Sunday Evening</p>
      </React.Fragment>
    );

    const fullReportResponseJSX = (
      <React.Fragment>
        <h4>{synopsisReport.title}</h4>
        {/* <br /> */}
        { synopsisReport.pointSheetStatus.turnedIn ? null
          : <React.Fragment>
            <p>Point Sheet not turned in.</p>
            </React.Fragment> }
        { synopsisReport.pointSheetStatus.turnedIn 
          && (synopsisReport.mentorGrantedPlayingTime === '' || synopsisReport.mentorGrantedPlayingTime === synopsisReport.earnedPlayingTime)
          ? <React.Fragment>
            <span className="title">
            Game Eligibility Earned
            </span>
            <span> {synopsisReport.earnedPlayingTime}</span>
          </React.Fragment>
          : <React.Fragment>
            <span className="title">Mentor Granted Playing Time</span>
            <span>{synopsisReport.mentorGrantedPlayingTime}</span>
            <br />
            <span className="title">Mentor Comments</span>
            <p>{synopsisReport.synopsisComments.mentorGrantedPlayingTimeComments}</p>
            <br /> 
            </React.Fragment> }
            {synopsisReport.synopsisComments.studentActionItems
              ? <React.Fragment>
                <br />
                <span className="title">Student Action Items</span>
                <p>{synopsisReport.synopsisComments.studentActionItems}</p>
                </React.Fragment>
              : null
            }
            {synopsisReport.synopsisComments.sportsUpdate 
              ? <React.Fragment>
                <br />
                <span className="title">Sports Update</span>
                <p>{synopsisReport.synopsisComments.sportsUpdate}</p>
                </React.Fragment>
              : null
            }
            <br />
            Link To Full Synopsis Report (RA Points, Grades, Mentor Comments, etc): 
            <a href={synopsisReport.synopsisLink} target="_blank" rel="noopener noreferrer"> CLICK HERE</a>
          </React.Fragment>
    );

    return (
      <div className="panel summary-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title title">{ playingTimeOnly ? 'Playing Time Saved' : 'Rainier Athletes Weekly Summary' }</h5>
              <button type="button" className="close" onClick={ this.props.onClose } data-dismiss="modal" aria-label="Close">
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
  onClose: PropTypes.func,
};

export default SynopsisReportSummary;
