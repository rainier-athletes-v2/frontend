import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Sidebar from '../side-bar/side-bar';
import MentorContent from '../mentor-content/mentor-content';
import SynopsisReportForm from '../synopsis-report-form/synopsis-report-form';
import SynopsisReportSummerForm from '../synopsis-report-summer-form/synopsis-report-summer-form';

import * as profileActions from '../../actions/profile';
import * as srListActions from '../../actions/synopsis-report-list';
import * as srActions from '../../actions/synopsis-report';
import * as srPdfActions from '../../actions/synopsis-report-pdf';

import './_mentor.scss';

const mapStateToProps = state => ({
  myStudents: state.myStudents,
  myProfile: state.myProfile,
  synopsisReport: state.synopsisReport,
});

const mapDispatchToProps = dispatch => ({
  fetchMyStudents: mentorId => dispatch(profileActions.fetchMyStudentsReq(mentorId)),
  fetchRecentSynopsisReports: studentId => dispatch(srListActions.fetchRecentSynopsisReports(studentId)),
  fetchSynopsisReport: reportId => dispatch(srActions.fetchSynopsisReport(reportId)),
  clearSynopsisReportLink: () => dispatch(srPdfActions.clearSynopsisReportLink()),
  clearSynopsisReport: () => dispatch(srActions.clearSynopsisReport()),
});

class Mentor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: {},
      modal: false,
      subPT: false,
      selected: -1,
    };
  }

  static getDerivedStateFromProps = (nextProps) => {
    if (nextProps.myStudents) {
      return { myStudents: nextProps.myStudents };
    }
    return null;
  }

  componentDidMount = () => {
    this.props.fetchMyStudents();
  }

  handleSidebarClick(e) {
    const i = e.currentTarget.dataset.index;
    if (this.props.myStudents[i].role === 'student') {
      this.props.clearSynopsisReport();
      this.props.fetchRecentSynopsisReports(this.props.myStudents[i].id);
      this.setState({
        ...this.state,
        content: this.props.myStudents[i],
        selected: i,
        subPT: false,
      });
    }
  }

  fetchStudents() {
    if (this.props.myStudents) {
      return this.props.myStudents.map((student, i) => {
        return (
          <li
            className={ this.state.selected === i.toString() ? 'nav-item selected' : 'nav-item' }
            key={i}
            data-index={i}
            onClick={ this.handleSidebarClick.bind(this) }>
            <a className="nav-link">
              { `${student.firstName} ${student.lastName}` }
            </a>
          </li>
        );
      });
    }

    return 'Loading...';
  }

  checkRole() {
    if (this.props.myProfile) {
      if (this.props.myProfile.role === 'admin') {
        return (
          <React.Fragment>
            <hr />
            <li
              className={ this.state.selected === 0 ? 'nav-item selected' : 'nav-item' }
              onClick={ this.handleSubPT }>
              <a className="nav-link">
                Fill Point Tracker as Substitute
              </a>
            </li>
          </React.Fragment>
        );
      }
    }

    return null;
  }

  handleSaveButtonClick = (e) => {
    if (e) {
      e.preventDefault();
      if (e.target.value) this.props.fetchSynopsisReport(e.target.value);
      this.props.fetchRecentSynopsisReports(this.state.content.id); // refresh student's recent SR list
    }
    this.setState({ modal: !this.state.modal });
  }

  handleEditSRClick = (e) => {
    e.preventDefault();
    this.props.clearSynopsisReportLink();
    this.props.fetchSynopsisReport(e.target.value);
    this.setState({ modal: !this.state.modal });
  }

  handleCancelButton = (e) => {
    e.preventDefault();
    this.setState({ modal: !this.state.modal });
  }

  handleSubPT = () => {
    this.setState({
      ...this.state,
      content: {},
      selected: -1,
      subPT: !this.state.subPT,
    });
  }

  render() {
    return (
      <React.Fragment>
        <div className="container-fluid">
          <div className="row">
          <Sidebar content={ this.fetchStudents() } role={ null }/>
          <MentorContent content={ this.state.content } subPT={ this.state.subPT } editSrClick={this.handleEditSRClick} >
            {
              this.state.modal ? <SynopsisReportSummerForm content={ this.state.content } saveClick={ this.handleSaveButtonClick } 
                cancelClick={this.handleCancelButton}/> : null
            }
          </ MentorContent>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Mentor.propTypes = {
  fetchMyStudents: PropTypes.func,
  fetchRecentSynopsisReports: PropTypes.func,
  fetchSynopsisReport: PropTypes.func,
  clearSynopsisReportLink: PropTypes.func,
  clearSynopsisReport: PropTypes.func,
  myStudents: PropTypes.array,
  myProfile: PropTypes.object,
  synopsisReport: PropTypes.object,
};


export default connect(mapStateToProps, mapDispatchToProps)(Mentor);
