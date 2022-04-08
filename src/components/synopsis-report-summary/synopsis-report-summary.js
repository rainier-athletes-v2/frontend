import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as bcActions from '../../actions/basecamp';
import * as srActions from '../../actions/synopsis-report';
import * as errorActions from '../../actions/error';

import './_synopsis-report-summary.scss';

const mapStateToProps = state => ({
  synopsisReportLink: state.synopsisReportLink,
  basecampToken: state.basecampToken,
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
    // const schoolName = 'Unknown';
    // this.setState({ schoolName });
    if (this.props.messageBoardUrl && this.props.synopsisReport && this.props.synopsisReport.Synopsis_Report_Status__c === 'Completed') {
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

    const studentName = sr.Student__r.Name.substring(0, sr.Student__r.Name.indexOf(' '));

   
    const block1 = `<strong>${studentName}&#39;s Update for ${sr.Week__c}</strong><br><br>

    <p>Hello Team ${studentName} - please see ${studentName}&#39;s Rainier Athletes update over the past week to ensure everyone is aligned and up to date around ${studentName}&#39;s progress on and off the field.</p><br>

    <p>${studentName} ${sr.Weekly_Check_In_Status__c === 'Met' ? 'met' : 'did not meet'} for check-in this week.</p><br>`;

    const optionalBlock2 = sr.Identity_Statement_Highlights__c
      ? `<p><strong>Identity Statement Highlights: </strong>
        ${sr.Identity_Statement_Highlights__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p></br><br>`
      : '';

    const block3 = `<p><strong>Point Sheet and School Update: </strong>
    ${studentName} ${sr.Point_Sheet_Status__c === 'Turned in' ? 'did' : 'did not'} turn in a point sheet. 
    ${sr.Point_Sheet_and_School_Update__c ? sr.Point_Sheet_and_School_Update__c.replace(/(?:\r\n|\r|\n)/g, '<br>') : ''}</p></br><br>`;

    const optionalBlock4 = sr.Sports_Update__c
      ? `<p><strong>Sports Update: </strong>${sr.Sports_Update__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p></br><br>`
      : '';

    const optionalBlock5 = sr.Additional_Comments__c
      ? `<p><strong>Additional Comments: </strong>${sr.Additional_Comments__c.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p></br><br>`
      : '';

    const block6 = this.props.images && this.props.images.length > 0 ? `<p><strong>Point Sheet & Images</strong></p><br>
    ${this.props.images.map(sgid => `<bc-attachment sgid="${sgid.attachable_sgid}"></bc-attachment><br>`)}<br>` : '';
    
    const block7 = `<p>Thanks and feel free to respond with comments or questions!</p></br><br>
    
    <p>${sr.Mentor__r.Name}<br>
    ${sr.Mentor__r.Rainier_Athletes_Email__c}<br>`;
    
    return `${block1}${optionalBlock2}${block3}${optionalBlock4}${optionalBlock5}${block6}${block7}`;
  };

  postSummary = () => {
    this.props.clearError();
    this.setState({ ...this.state, waitingOnBasecamp: true });
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
    return (<React.Fragment><h5>Summary not posted to Basecamp. Contact an administrator.</h5>
      <button onClick={ this.props.onClose } className="btn btn-secondary" type="reset">Close</button>
      </React.Fragment>);
  }

  render() {
    if (!this.props.synopsisReport) return null;

    const { synopsisReport } = this.props;
    const sr = synopsisReport;
    const imageCount = this.props.images && this.props.images.length;
    const studentName = sr.Student__r.Name.substr(0, sr.Student__r.Name.indexOf(' '));
 
    const fullReportResponseJSX = (
      <React.Fragment>
        <h4>{studentName}&#39;s Update for {sr.Week__c}</h4>

        <p>Hello Team {studentName} - please see {studentName}&#39;s Rainier Athletes update over the past week to ensure everyone is aligned and up to date around {studentName}&#39;s progress on and off the field.</p>

        <p>{studentName} {sr.Weekly_Check_In_Status__c === 'Met' ? 'met ' : 'did not meet '} for check-in this week.</p>

        {sr.Identity_Statement_Highlights__c ? <p><strong>Identity Statement Highlights: </strong>{sr.Identity_Statement_Highlights__c}</p> : '' }
        
        <p><strong>Point Sheet and School Update: </strong>{studentName} {sr.Point_Sheet_Status__c === 'Turned in' ? ' turned in' : ' did not turn in'} a point sheet. {sr.Point_Sheet_and_School_Update__c}</p>
    
        {sr.Sports_Update__c ? <p><strong>Sports Update: </strong>{sr.Sports_Update__c}</p> : ''}

        {sr.Additional_Comments__c ? <p><strong>Additional Comments: </strong>{sr.Additional_Comments__c}</p> : ''}

        <p>{!imageCount ? null : imageCount > 1 ? 'Multiple images have been posted to Basecamp.' : 'Point Sheet image has been posted to basecamp.' }</p> {/* eslint-disable-line */}
    
        <p>Thanks and feel free to respond with comments or questions!</p>
        
        <p>{sr.Mentor__r.Name}<br />
        {sr.Mentor__r.Rainier_Athletes_Email__c}<br /></p>
    </React.Fragment>
    );
    
    return (
      <div className="panel summary-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title title">Rainier Athletes Weekly Summary</h5>
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
              { fullReportResponseJSX }
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
