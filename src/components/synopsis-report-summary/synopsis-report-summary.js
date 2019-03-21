import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as pl from '../../lib/pick-list-tests';
import * as srActions from '../../actions/synopsis-report-summary';
import * as srPdfActions from '../../actions/synopsis-report-pdf';

import './_synopsis-report-summary.scss';

const mapStateToProps = state => ({
  synopsisLink: state.synopsisReportLink,
  basecampToken: state.basecampToken,
  srSummaryStatus: state.srSummaryStatus,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
});

const mapDispatchToProps = dispatch => ({
  postSrSummary: srSummary => dispatch(srActions.postSrSummary(srSummary)),
  clearSrSummaryStatus: () => dispatch(srActions.clearSrSummaryStatus()),
  setSynopsisReportLink: () => dispatch(srPdfActions.clearSynopsisReportLink()),
});

class SynopsisReportSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.mbUrlRetrieved = !!props.messageBoardUrl;
    this.state.summarySaved = false;
    this.state.waitingForSave = false;
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.srSummaryStatus !== prevProps.srSummaryStatus) {
      console.log('srSummaryStatus changed from', prevProps.srSummaryStatus, 'to', this.props.srSummaryStatus);
      this.setState({
        ...this.state,
        summarySaved: !!this.props.srSummaryStatus, // save complete if status is non-null
        waitingForSave: !this.props.srSummaryStatus, // set waiting false if status is null (cleared)
        mbUrlRetrieved: !!this.props.messageBoardUrl,
      });
      if (this.props.srSummaryStatus < 300) { // expect 201 on success
        this.props.onClose(); // force close of modal
      } else {
        alert(`An error occured posting to Basecamp, status ${this.props.srSummaryStatus}`);
      }
    }
  }

  handleCopy = () => {
    const range = document.getSelection().getRangeAt(0);
    range.selectNode(document.getElementById('body'));
    window.getSelection().addRange(range);
    document.execCommand('copy');
  }

  handlePostSrSummary = () => {
    this.props.clearSrSummaryStatus();
    this.setState({ ...this.state, summarySaved: false, waitingForSave: true });

    const srSummary = {
      subject: `Synopsis Report Summary for ${this.props.synopsisReport.Week__c}`,
      content: document.getElementById('body').innerHTML,
      basecampToken: this.props.basecampToken,
      messageBoardUrl: this.props.messageBoardUrl,
    };

    return this.props.postSrSummary(srSummary);
  }

  render() {
    if (!this.props.synopsisReport) return null;

    const { synopsisReport } = this.props;
    const playingTimeOnly = pl.playingTimeOnly(synopsisReport.Synopsis_Report_Status__c);

    const playingTimeOnlyResponseJSX = (
      <React.Fragment>
        <p className="centered">Thank you for submitting your mentee&#39;s playing time.</p>
        <p className="centered">Please remember to complete their full report by Sunday Evening</p>
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
          && (!synopsisReport.Mentor_Granted_Playing_Time__c || synopsisReport.Mentor_Granted_Playing_Time__c === synopsisReport.Earned_Playing_Time__c)
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
              {/* eslint-disable-next-line no-nested-ternary */}
              {this.state.waitingForSave 
                ? <FontAwesomeIcon icon="spinner" className="fa-spin fa-2x"/> 
                // eslint-disable-next-line no-nested-ternary
                : playingTimeOnly 
                  ? <h3><button onClick={ this.props.onClose } className="btn btn-secondary" id="pt-only" type="submit">Click to Dismiss</button></h3> 
                  : this.props.messageBoardUrl
                    ? <h3><button onClick={ this.handlePostSrSummary } className="btn btn-secondary" id="full-report" type="submit">Post Summary</button>  to Student&#39;s Basecamp Message Board</h3>
                    : <h5>Unable to post to Basecamp. Missing message board link. Be sure you and student are members of the project and student email is the same in Basecamp and Salesforce.</h5>
              }
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
  basecampToken: PropTypes.string,
  messageBoardUrl: PropTypes.string,
  error: PropTypes.string,
  onClose: PropTypes.func,
  postSrSummary: PropTypes.func,
  clearSrSummaryStatus: PropTypes.func,
  setSynopsisReportLink: PropTypes.func,
  srSummaryStatus: PropTypes.number,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummary);
