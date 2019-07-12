import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as srActions from '../../actions/synopsis-report-summary';

import './_synopsis-report-summer-summary.scss';

const mapStateToProps = state => ({
  basecampToken: state.basecampToken,
  srSummaryStatus: state.srSummaryStatus,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
});

const mapDispatchToProps = dispatch => ({
  postSrSummary: srSummary => dispatch(srActions.postSrSummary(srSummary)),
  clearSrSummaryStatus: () => dispatch(srActions.clearSrSummaryStatus()),
});

class SynopsisReportSummerSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.mbUrlRetrieved = !!props.messageBoardUrl;
    this.state.summarySaved = false;
    this.state.waitingForSave = false;
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.srSummaryStatus !== prevProps.srSummaryStatus) {
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

    const fullReportResponseJSX = (
      <React.Fragment>
        <h4>{synopsisReport.Week__c}</h4>
        <p><strong>{ synopsisReport.Summer_weekly_connection_made__c === 'Yes' ? 'Weekly Connection Status' : 'Reason for missed weekly connection' }</strong></p>
        { synopsisReport.Summer_weekly_connection_status__c.split(',').map((status, i, list) => {
          return (<span key={i}>{status}{ i < list.length - 1 ? <br /> : null}</span>);
        }) }
        <br />
        { synopsisReport.Summer_weekly_connection_status__c.indexOf('We did not connect') !== -1 ? <p>{ synopsisReport.Summer_weekly_connection_other_notes__c }<br /></p> : null }
        <p><strong>{ synopsisReport.Summer_question_of_the_week_answered__c === 'Yes' ? 'Question of The Week Response' : 'Reason for not answering Question of The Week' }</strong></p>
        <p>{ synopsisReport.Summer_question_of_the_week_response__c }</p>
        <br />
        <p><strong>Last Summer Camp Attendance</strong></p>
        <p>Student { synopsisReport.Summer_attended_last_camp__c === 'Yes' ? 'attended' : 'did not attend' } the last summer camp.</p>
        { synopsisReport.Summer_attended_last_camp_notes__c ? <p>{ synopsisReport.Summer_attended_last_camp_notes__c }</p> : null }
        <br />
        <p><strong>Plans for Next Summer Camp Attendance</strong></p>
        <p>Student { synopsisReport.Summer_attend_next_camp__c === 'Yes' ? 'plans' : 'does not plan' } to attend the next summer camp.</p>
        { synopsisReport.Summer_next_camp_notes__c ? <p>{ synopsisReport.Summer_next_camp_notes__c }</p> : null }
      </React.Fragment>
    );

    return (
      <div className="panel summary-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title title">{ 'Rainier Athletes Weekly Summary' }</h5>
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
              { 
                fullReportResponseJSX
              }
            </div>

            <div className="modal-footer">
              {/* eslint-disable-next-line no-nested-ternary */}
              {this.state.waitingForSave 
                ? <FontAwesomeIcon icon="spinner" className="fa-spin fa-2x"/> 
                // eslint-disable-next-line no-nested-ternary
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

SynopsisReportSummerSummary.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummerSummary);
