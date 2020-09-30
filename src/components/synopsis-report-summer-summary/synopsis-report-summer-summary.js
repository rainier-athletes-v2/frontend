import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import clearSynopsisReport from '../../actions/synopsis-report';
import clearError from '../../actions/error';
import * as bcActions from '../../actions/basecamp';

import './_synopsis-report-summer-summary.scss';

const mapStateToProps = state => ({
  basecampToken: state.basecampToken,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
});

const mapDispatchToProps = dispatch => ({
  postSummaryToBasecamp: srSummary => dispatch(bcActions.postSummaryToBasecamp(srSummary)),
  clearError: () => dispatch(clearError()),
  clearSynopsisReport: () => dispatch(clearSynopsisReport()),
});

class SynopsisReportSummerSummary extends React.Component {
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
    if (this.props.messageBoardUrl) {
      this.setState({ waitingOnBasecamp: true });
      return this.postSummary();
    }
    this.setState({ waitingOnBasecamp: false });
    return null;
  }

  postSummary = () => {
    // this.props.clearBasecampStatus();
    // this.props.clearSynopsisReport();
    // this.setState({ ...this.state, waitingOnBasecamp: true });

    const srSummary = {
      subject: `Synopsis Report Summary for ${this.props.synopsisReport.Week__c}`,
      content: document.getElementById('body').innerHTML,
      basecampToken: this.props.basecampToken,
      messageBoardUrl: this.props.messageBoardUrl,
    };

    return this.props.postSummaryToBasecamp(srSummary);
  }

  basecampResponse = () => {
    if (this.props.messageBoardUrl) {
      return (<React.Fragment>
      <h5>{this.props.error < 300 ? 'Summary posted to Basecamp.' : 'Error posting summary to Basecamp. Contact an Adminstrator.'}</h5><button onClick={ this.props.onClose } className="btn btn-secondary" type="reset">Close</button>
      </React.Fragment>);
    }
    return (<React.Fragment><h5>Summary not posted to Basecamp. Contact an administrator.</h5>;
      <button onClick={ this.props.onClose } className="btn btn-secondary" type="reset">Close</button>
      </React.Fragment>);
  }

  render() {
    if (!this.props.synopsisReport) return null;

    const { synopsisReport } = this.props;

    const fullReportResponseJSX = (
      <React.Fragment>
        <h4>{synopsisReport.Week__c}</h4>
        <br />
        <p><strong>{ synopsisReport.Weekly_Check_In_Status__c === 'Yes' ? 'Weekly Connection Status' : 'Reason for missed weekly connection' }</strong></p>
        { synopsisReport.Summer_conn_met__c ? 'Mentor met with student social-distancing in-person. ' : null }
        { synopsisReport.Summer_conn_called__c ? 'Mentor checked in with student via video call. ' : null }
        { synopsisReport.Summer_conn_late_call__c ? 'Mentor checked in with student via phone call. ' : null }
        { synopsisReport.Summer_conn_basecamp__c ? 'Mentor and student connected via Basecamp. ' : null }
        { synopsisReport.Summer_conn_no_answer__c ? 'Mentor was unable to reach out this week. ' : null }
        { synopsisReport.Summer_conn_no_show__c ? 'Mentor tried reaching out but had trouble connecting. ' : null }
        { synopsisReport.Summer_conn_missed_other__c ? 'We did not connect for reasons explained below: ' : null }
        { synopsisReport.Summer_conn_missed_other__c ? <React.Fragment><br /><p>{ synopsisReport.Summer_weekly_connection_other_notes__c }</p></React.Fragment> : null }
        <br /><br />
        {/* <p><strong>Question of The Week</strong></p><p>{ synopsisReport.Summer_question_of_the_week_answered__c === 'Yes' ? 'Student answered Question of The Week.' : 'Student did not answer Question of The Week.' }</p>
        <br />
        <p><strong>Last Summer Camp Attendance</strong></p>
        <p>Student { synopsisReport.Summer_attended_last_camp__c === 'Yes' ? 'attended' : 'did not attend' } the last summer camp.</p>
        { synopsisReport.Summer_attended_last_camp_notes__c ? <p>{ synopsisReport.Summer_attended_last_camp_notes__c }</p> : null }
        <br />
        <p><strong>Plans for Next Summer Camp Attendance</strong></p>
        <p>Student { synopsisReport.Summer_attend_next_camp__c === 'Yes' ? 'plans' : 'does not plan' } to attend the next summer camp.</p>
        { synopsisReport.Summer_next_camp_notes__c ? <p>{ synopsisReport.Summer_next_camp_notes__c }</p> : null } */}
        { synopsisReport.Whats_been_happening__c ? <React.Fragment><p><strong>What&#39;s Been Happening?</strong></p></React.Fragment> : null }
        { synopsisReport.Whats_been_happening__c ? <React.Fragment><p>{ synopsisReport.Whats_been_happening__c }</p></React.Fragment> : null }

        { synopsisReport.Online_School_Update__c ? <React.Fragment><p><strong>Online School Update</strong></p></React.Fragment> : null }
        { synopsisReport.Online_School_Update__c ? <React.Fragment><p>{ synopsisReport.Online_School_Update__c }</p></React.Fragment> : null }

        { synopsisReport.Summer_additional_team_comments__c ? <React.Fragment><p><strong>Additional Team Comments</strong></p></React.Fragment> : null }
        { synopsisReport.Summer_additional_team_comments__c ? <React.Fragment><p>{ synopsisReport.Summer_additional_team_comments__c }</p></React.Fragment> : null }
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
              {this.state.waitingOnBasecamp 
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

SynopsisReportSummerSummary.propTypes = {
  synopsisReport: PropTypes.object,
  synopsisLink: PropTypes.string,
  basecampToken: PropTypes.string,
  messageBoardUrl: PropTypes.string,
  error: PropTypes.number,
  onClose: PropTypes.func,
  postSummaryToBasecamp: PropTypes.func,
  // clearBasecampStatus: PropTypes.func,
  clearSynopsisReport: PropTypes.func,
  // setSynopsisReportLink: PropTypes.func,
  // basecampStatus: PropTypes.number,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummerSummary);
