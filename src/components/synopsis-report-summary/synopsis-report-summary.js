import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as pl from '../../lib/pick-list-tests';
import * as bcActions from '../../actions/basecamp';
import * as srActions from '../../actions/synopsis-report';
import * as errorActions from '../../actions/error';
// import * as srPdfActions from '../../actions/synopsis-report-pdf';

import './_synopsis-report-summary.scss';

const mapStateToProps = state => ({
  synopsisReportLink: state.synopsisReportLink,
  basecampToken: state.basecampToken,
  // srSummaryStatus: state.srSummaryStatus,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
  images: state.bcImages,
});

const mapDispatchToProps = dispatch => ({
  postSummaryToBasecamp: srSummary => dispatch(bcActions.postSummaryToBasecamp(srSummary)),
  clearError: () => dispatch(errorActions.clearError()),
  clearSynopsisReport: () => dispatch(srActions.clearSynopsisReport()),
});

class SynopsisReportSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.waitingOnBasecamp = true;
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.error !== prevProps.error) {
      if (this.state.waitingOnBasecamp) {
        this.setState({
          ...this.state,
          waitingOnBasecamp: false,
        });
      }
    }
  }

  componentDidMount = () => {
    const sr = this.props.synopsisReport;
    const schoolName = sr.PointTrackers__r 
      && sr.PointTrackers__r.records
      && sr.PointTrackers__r.records[0].Class__r
      && sr.PointTrackers__r.records[0].Class__r.School__r
      && sr.PointTrackers__r.records[0].Class__r.School__r.Name ? sr.PointTrackers__r.records[0].Class__r.School__r.Name : null;
    this.setState({ schoolName });
    if (this.props.messageBoardUrl && this.props.synopsisReport && pl.completed(this.props.synopsisReport.Synopsis_Report_Status__c)) {
      this.setState({ waitingOnBasecamp: true });
      return this.postSummary();
    }
    this.setState({ waitingOnBasecamp: false });
    return null;
  }

  handleCopy = () => {
    const range = document.getSelection().getRangeAt(0);
    range.selectNode(document.getElementById('body'));
    window.getSelection().addRange(range);
    document.execCommand('copy');
  }

  fullReportResponseRTF = (sr) => {
    if (!sr) return null;

    return (
      `<strong>${sr.Student__r.Name}&#39;s RA Synopsis Report for ${sr.Week__c}</strong><br><br>

    <p>${sr.Student__r.Name} ${sr.Weekly_Check_In_Status__c === 'Met' ? 'met' : 'did not meet'} for check-in this week and 
    ${sr.Point_Sheet_Status__c === 'Turned in' ? 'did' : 'did not'} turn in a point sheet.</p><br>

    ${sr.Point_Sheet_Status__c === 'Did not meet' ? '<p>Explanation for not meeting: ' : ''}
    ${sr.Weekly_Check_In_Status__c === 'Did not meet' ? `${sr.Weekly_Check_In_Missed_Reason__c}</p><br>` : ''}

    ${sr.Point_Sheet_Status__c === 'Not turned in' 
        ? `<p>${sr.Student__r.Name} did not turn in a point sheet for reason: ${sr.Point_Sheet_Status_Reason__c !== 'Other' ? sr.Point_Sheet_Status_Reason__c : sr.Point_Sheet_Status_Notes__c}</p><br>`
        : ''}
    
    <p><strong>Game Eligibility Earned:</strong> ${sr.Mentor_Granted_Playing_Time__c ? sr.Mentor_Granted_Playing_Time__c : sr.Earned_Playing_Time__c}</p><br>
    
    ${sr.Mentor_Granted_Playing_Time_Explanation__c ? `<p>${sr.Mentor_Granted_Playing_Time_Explanation__c}</p><br>` : ''}
    
    <p><strong>Student Action Items</strong><br><br>${sr.Student_Action_Items__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p><br>
    
    <p><strong>Sports Update</strong><br><br>${sr.Sports_Update__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p><br>
    
    <p><strong>Additional Comments</strong><br><br>${sr.Additional_Comments__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p><br>
    
    <strong>Link To Full Synopsis Report</strong> (RA Points, Grades, Mentor Comments, etc): 
    <a href=${this.props.synopsisReportLink} target="_blank"> CLICK HERE</a><br><br>
    
    <p>Thanks and feel free to respond with comments or questions!</p><br>
    
    <p>${sr.Mentor__r.Name}<br>
    ${sr.Mentor__r.npe01__HomeEmail__c}<br>
    ${sr.PointTrackers__r 
      && sr.PointTrackers__r.records
      && sr.PointTrackers__r.records[0].Class__r
      && sr.PointTrackers__r.records[0].Class__r.School__r
      && sr.PointTrackers__r.records[0].Class__r.School__r.Name ? sr.PointTrackers__r.records[0].Class__r.School__r.Name : null}<br><br>
  
      ${this.props.images && this.props.images.length > 0 
        ? this.props.images.map(sgid => `<bc-attachment sgid="${sgid.attachable_sgid}"></bc-attachment>`) : ''}`
    );
  };

  postSummary = () => {
    this.props.clearError();
    this.setState({ ...this.state, summarySaved: false, waitingForSave: true });
    const content = this.fullReportResponseRTF(this.props.synopsisReport);
    const srSummary = {
      subject: `Synopsis Report Summary for ${this.props.synopsisReport.Week__c}`,
      content,
      basecampToken: this.props.basecampToken,
      messageBoardUrl: this.props.messageBoardUrl,
    };

    return this.props.postSummaryToBasecamp(srSummary);
  }

  basecampResponse = () => {
    if (pl.playingTimeOnly(this.props.synopsisReport.Synopsis_Report_Status__c)) {
      return (<React.Fragment>
        <h5>Eligibility Recorded</h5>
        <button onClick={ this.props.onClose } className="btn btn-secondary" type="reset">Close</button>
      </React.Fragment>);
    }
    if (this.props.messageBoardUrl) {
      return (<React.Fragment>
      <h5>{this.props.error < 300 ? 'Summary posted to Basecamp.' : 'Error posting summary to Basecamp. Contact an Adminstrator.'}</h5><button onClick={ this.props.onClose } className="btn btn-secondary" type="reset">Close</button>
      </React.Fragment>);
    }
    return (<React.Fragment><h5>Summary not posted to Basecamp. Contact an administrator.</h5>
      <button onClick={ this.props.onClose } className="btn btn-secondary" type="reset">Close</button>
      </React.Fragment>);
  }

  render() {
    if (!this.props.synopsisReport) return null;

    const { synopsisReport } = this.props;
    const sr = synopsisReport;
    const playingTimeOnly = pl.playingTimeOnly(synopsisReport.Synopsis_Report_Status__c);

    const playingTimeOnlyResponseJSX = (
      <React.Fragment>
        <p className="centered">Thank you for submitting your mentee&#39;s playing time.</p>
        <p className="centered">Please remember to complete their full report by Sunday Evening</p>
      </React.Fragment>
    );
    
    const fullReportResponseJSX = (
      <React.Fragment>
        <h4>{sr.Student__r.Name}&#39;s RA Synopsis Report for {sr.Week__c}</h4><br />
        <p>{sr.Student__r.Name} {sr.Weekly_Check_In_Status__c === 'Met' ? 'met ' : 'did not meet '} for check-in this week and 
    {sr.Point_Sheet_Status__c === 'Turned in' ? ' did ' : ' did not '} turn in a point sheet.</p>

    {sr.Point_Sheet_Status__c === 'Did not meet' ? <React.Fragment><p>Explanation for not meeting: {sr.Weekly_Check_In_Missed_Reason__c}</p></React.Fragment> : null}

    {sr.Point_Sheet_Status__c === 'Not turned in' 
      ? <React.Fragment><p>{sr.Student__r.Name} did not turn in a point sheet for reason:   
      {sr.Point_Sheet_Status_Reason__c !== 'Other' ? <React.Fragment> {sr.Point_Sheet_Status_Reason__c}</React.Fragment> : <React.Fragment> {sr.Point_Sheet_Status_Notes__c}</React.Fragment>}</p></React.Fragment>
      : null}
    
    <React.Fragment>
    <p><strong>Game Eligibility Earned:</strong> {sr.Mentor_Granted_Playing_Time__c ? sr.Mentor_Granted_Playing_Time__c : sr.Earned_Playing_Time__c}</p>
    </React.Fragment>
    {sr.Mentor_Granted_Playing_Time_Explanation__c ? <React.Fragment><p>{sr.Mentor_Granted_Playing_Time_Explanation__c}</p></React.Fragment> : null}
    
    {sr.Student_Action_Items__c
      ? <React.Fragment>
        <br />
        <p><strong>Student Action Items</strong></p>
        <p>{sr.Student_Action_Items__c}</p>
        </React.Fragment>
      : null
    }
    {sr.Sports_Update__c 
      ? <React.Fragment>
        <br />
        <p><strong>Sports Update</strong></p>
        <p>{sr.Sports_Update__c}</p>
        </React.Fragment>
      : null
    }
    {sr.Additional_Comments__c 
      ? <React.Fragment>
        <br />
        <p><strong>Additional Comments</strong></p>
        <p>{sr.Additional_Comments__c}</p>
        </React.Fragment>
      : null
    }
    
    <p><strong>Link To Full Synopsis Report</strong> (RA Points, Grades, Mentor Comments, etc): 
    <a href={this.props.synopsisReportLink} target="_blank" rel="noopener noreferrer"> CLICK HERE</a></p>
    
    <p>Thanks and feel free to respond with comments or questions!</p>
    
    <p>{sr.Mentor__r.Name}<br />
    {sr.Mentor__r.npe01__HomeEmail__c}<br />
    {this.state.schoolName}</p>

    {!this.props.images ? null : this.props.images.length > 1 ? 'Multiple images have been posted to Basecamp.' : 'An image has been posted to basecamp.' }` {/* eslint-disable-line */}
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
              { this.state.waitingOnBasecamp
                ? <h5>Saving summary to Basecamp...</h5>
                : this.basecampResponse() 
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
  synopsisReportLink: PropTypes.string,
  basecampToken: PropTypes.string,
  messageBoardUrl: PropTypes.string,
  error: PropTypes.number,
  images: PropTypes.array,
  onClose: PropTypes.func,
  postSummaryToBasecamp: PropTypes.func,
  clearSrSummaryStatus: PropTypes.func,
  clearError: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummary);
