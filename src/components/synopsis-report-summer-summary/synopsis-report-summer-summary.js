import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import clearSynopsisReport from '../../actions/synopsis-report';
import * as errorActions from '../../actions/error';
import * as bcActions from '../../actions/basecamp';

import './_synopsis-report-summer-summary.scss';

const mapStateToProps = state => ({
  basecampToken: state.basecampToken,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
  images: state.bcImages,
});

const mapDispatchToProps = dispatch => ({
  postSummaryToBasecamp: srSummary => dispatch(bcActions.postSummaryToBasecamp(srSummary)),
  clearError: () => dispatch(errorActions.clearError()),
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

  fullReportResponseRTF = (sr) => {
    if (!sr) return null;

    const studentName = sr.Student__r.Name.substring(0, sr.Student__r.Name.indexOf(' '));

    return (
      `<strong>${studentName}&#39;s RA Synopsis Report for ${sr.Week__c}</strong><br><br>

    <p>${sr.Weekly_Check_In_Status__c === 'Met' ? 'Weekly Connection Status:' : 'Reason for missed weekly connection:'}
    ${sr.Summer_conn_met__c ? 'Mentor met with student social-distancing in-person. ' : ''}
    ${sr.Summer_conn_called__c ? 'Mentor checked in with student via video call. ' : ''}
    ${sr.Summer_conn_late_call__c ? 'Mentor checked in with student via phone call. ' : ''}
    ${sr.Summer_conn_basecamp__c ? 'Mentor and student connected via Basecamp. ' : ''}
    ${sr.Summer_conn_no_answer__c ? 'Mentor was unable to reach out this week. ' : ''}
    ${sr.Summer_conn_no_show__c ? 'Mentor tried reaching out but had trouble connecting. ' : ''}
    ${sr.Summer_conn_missed_other__c ? 'We did not connect for reasons explained below: ' : '</p><br>'}
    ${sr.Summer_conn_missed_other__c ? `<p>${sr.Summer_weekly_connection_other_notes__c}</p><br>` : ''}

    ${sr.Whats_been_happening__c ? '<strong>What&#39;s Been Happening?</strong>' : ''}
    ${sr.Whats_been_happening__c ? `<p>${sr.Whats_been_happening__c}</p><br>` : ''}
    
    ${sr.Online_School_Update__c ? '<strong>Online School Update</strong>' : ''}
    ${sr.Online_School_Update__c ? `<p>${sr.Online_School_Update__c}</p><br>` : ''}

    ${sr.Summer_additional_team_comments__c ? '<strong>Additional Team Comments</strong>' : ''}
    ${sr.Summer_additional_team_comments__c ? `<p>${sr.Summer_additional_team_comments__c}</p><br>` : ''}
    
    <p>Thanks and feel free to respond with comments or questions!</p><br>
    
    <p>${sr.Mentor__r.Name}<br>
    ${sr.Mentor__r.Email}<br>
    ${this.state.schoolName ? this.state.schoolName : ''}<br><br>
  
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
    const imageCount = this.props.images && this.props.images.length;

    const fullReportResponseJSX = (
      <React.Fragment>
        <h4>{synopsisReport.Week__c}</h4>
        <br />
        <p><strong>{ synopsisReport.Weekly_Check_In_Status__c === 'Met' ? 'Weekly Connection Status' : 'Reason for missed weekly connection' }</strong></p>
        { synopsisReport.Summer_conn_met__c ? 'Mentor met with student social-distancing in-person. ' : '' }
        { synopsisReport.Summer_conn_called__c ? 'Mentor checked in with student via video call. ' : '' }
        { synopsisReport.Summer_conn_late_call__c ? 'Mentor checked in with student via phone call. ' : '' }
        { synopsisReport.Summer_conn_basecamp__c ? 'Mentor and student connected via Basecamp. ' : '' }
        { synopsisReport.Summer_conn_no_answer__c ? 'Mentor was unable to reach out this week. ' : '' }
        { synopsisReport.Summer_conn_no_show__c ? 'Mentor tried reaching out but had trouble connecting. ' : '' }
        { synopsisReport.Summer_conn_missed_other__c ? 'We did not connect for reasons explained below: ' : '' }
        { synopsisReport.Summer_conn_missed_other__c ? <React.Fragment><br /><p>{ synopsisReport.Summer_weekly_connection_other_notes__c }</p></React.Fragment> : '' }
        <br /><br />
      
        { synopsisReport.Whats_been_happening__c ? <React.Fragment><p><strong>What&#39;s Been Happening?</strong></p></React.Fragment> : null }
        { synopsisReport.Whats_been_happening__c ? <React.Fragment><p>{ synopsisReport.Whats_been_happening__c }</p></React.Fragment> : null }
        { synopsisReport.Whats_been_happening__c ? <React.Fragment><br /></React.Fragment> : null }

        { synopsisReport.Online_School_Update__c ? <React.Fragment><p><strong>Online School Update</strong></p></React.Fragment> : null }
        { synopsisReport.Online_School_Update__c ? <React.Fragment><p>{ synopsisReport.Online_School_Update__c }</p></React.Fragment> : null }
        { synopsisReport.Online_School_Update__c ? <React.Fragment><br /></React.Fragment> : null }

        { synopsisReport.Summer_additional_team_comments__c ? <React.Fragment><p><strong>Additional Team Comments</strong></p></React.Fragment> : null }
        { synopsisReport.Summer_additional_team_comments__c ? <React.Fragment><p>{ synopsisReport.Summer_additional_team_comments__c }</p></React.Fragment> : null }
        { synopsisReport.Summer_additional_team_comments__c ? <React.Fragment><br /></React.Fragment> : null }
        <br />
        <p>Thanks and feel free to respond with comments or questions!</p>
    
        <p>{synopsisReport.Mentor__r.Name}<br />
        {synopsisReport.Mentor__r.Email}<br />
        {this.state.schoolName ? this.state.schoolName : ''}</p>

        {!imageCount ? null : imageCount > 1 ? 'Multiple images have been posted to Basecamp.' : 'An image has been posted to basecamp.' } {/* eslint-disable-line */}
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
  images: PropTypes.array,
  onClose: PropTypes.func,
  postSummaryToBasecamp: PropTypes.func,
  // clearBasecampStatus: PropTypes.func,
  clearSynopsisReport: PropTypes.func,
  // setSynopsisReportLink: PropTypes.func,
  // basecampStatus: PropTypes.number,
  clearError: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummerSummary);
