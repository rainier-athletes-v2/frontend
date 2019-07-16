import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    return this.postSummary();
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
        { synopsisReport.Summer_weekly_connection_status__c.indexOf('We did not connect') !== -1 ? <p>{ synopsisReport.Summer_weekly_connection_other_notes__c }</p> : null }
        <br />
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

    const basecampResponseJSX = (
      <React.Fragment>
        <h5>{this.props.error < 300 ? 'Summary posted to Basecamp.' : 'Error posting summary to Basecamp. Contact an Adminstrator.'}</h5>
        <button onClick={ this.props.onClose } className="btn btn-secondary" type="reset">Close</button>
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
              {this.state.waitingOnBasecamp 
                ? <h5>Saving summary to Basecamp...</h5> 
                // eslint-disable-next-line no-nested-ternary
                : basecampResponseJSX
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
