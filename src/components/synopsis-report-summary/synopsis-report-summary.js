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
    if (this.props.messageBoardUrl && this.props.synopsisReport && pl.playingTimeOnly(this.props.synopsisReport.Synopsis_Report_Status__c)) {
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

  fullReportResponseRTF = synopsisReport => (`
    ${pl.turnedIn(synopsisReport.Point_Sheet_Status__c) ? '' : '<p>Point Sheet not turned in.</p><br>'}
    ${pl.turnedIn(synopsisReport.Point_Sheet_Status__c)
      && (!synopsisReport.Mentor_Granted_Playing_Time__c || synopsisReport.Mentor_Granted_Playing_Time__c === synopsisReport.Earned_Playing_Time__c)
    ? `<strong>Game Eligibility Earned: </strong>${synopsisReport.Earned_Playing_Time__c}<br>`
    : `<strong>Mentor Granted Playing Time: </strong>${synopsisReport.Mentor_Granted_Playing_Time__c}
        <br><br>
        <strong>Mentor Comments</strong><br>
        <p>${synopsisReport.Mentor_Granted_Playing_Time_Explanation__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>`
    }
    ${synopsisReport.Student_Action_Items__c
      ? `<br><strong>Student Action Items</strong><br>
          <p>${synopsisReport.Student_Action_Items__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>`
      : ''}
    ${synopsisReport.Sports_Update__c 
        ? `<br><strong>Sports Update</strong><br>
          <p>${synopsisReport.Sports_Update__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>`
        : ''}
    <br>
    <strong>Link To Full Synopsis Report</strong> (RA Points, Grades, Mentor Comments, etc): 
    <a href=${this.props.synopsisReportLink} target="_blank"> CLICK HERE</a>`
  );
  //  rel="noopener noreferrer"

  postSummary = () => {
    this.props.clearError();
    // this.setState({ ...this.state, summarySaved: false, waitingForSave: true });
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
        { pl.turnedIn(synopsisReport.Point_Sheet_Status__c) ? null
          : <React.Fragment>
            <p>Point Sheet not turned in.</p><br />
            </React.Fragment> }
        { pl.turnedIn(synopsisReport.Point_Sheet_Status__c)
          && (!synopsisReport.Mentor_Granted_Playing_Time__c || synopsisReport.Mentor_Granted_Playing_Time__c === synopsisReport.Earned_Playing_Time__c)
          ? <React.Fragment>
            <p><strong>
            Game Eligibility Earned
            </strong></p>
            <br />
            <p>{synopsisReport.Earned_Playing_Time__c}</p> 
          </React.Fragment>
          : <React.Fragment>
            <p><strong>Mentor Granted Playing Time</strong></p>
            <p>{synopsisReport.Mentor_Granted_Playing_Time__c}</p>
            <br />
            <p><strong>Mentor Comments</strong></p>
            <p>{synopsisReport.Mentor_Granted_Playing_Time_Explanation__c}</p>
            <br /> 
            </React.Fragment> }
            {synopsisReport.Student_Action_Items__c
              ? <React.Fragment>
                <br />
                <p><strong>Student Action Items</strong></p>
                <p>{synopsisReport.Student_Action_Items__c}</p>
                </React.Fragment>
              : null
            }
            {synopsisReport.Sports_Update__c 
              ? <React.Fragment>
                <br />
                <p><strong>Sports Update</strong></p>
                <p>{synopsisReport.Sports_Update__c}</p>
                </React.Fragment>
              : null
            }
            <br />
            <p>Link To Full Synopsis Report (RA Points, Grades, Mentor Comments, etc): 
            <a href={this.props.synopsisReportLink} target="_blank" rel="noopener noreferrer"> CLICK HERE</a></p>
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
  onClose: PropTypes.func,
  postSummaryToBasecamp: PropTypes.func,
  clearSrSummaryStatus: PropTypes.func,
  clearError: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummary);
