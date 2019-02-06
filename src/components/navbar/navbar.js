import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import * as authActions from '../../actions/auth';
import * as routes from '../../lib/routes';
import googleBtn from '../../assets/google-btn.png';
import rainierBtn from '../../assets/rainier-logo-horizontal.png';

import './navbar.scss';

import * as profileActions from '../../actions/profile';

const mapStateToProps = state => ({
  loggedIn: !!state.token,
  myProfile: state.myProfile,
});

const mapDispatchToProps = dispatch => ({
  doLogout: () => dispatch(authActions.logout()),
  fetchProfiles: profile => dispatch(profileActions.fetchProfileReq(profile)),
  fetchMyProfile: profile => dispatch(profileActions.fetchMyProfileReq(profile)),
  fetchStudents: studentIds => dispatch(profileActions.fetchStudentsReq(studentIds)),
  fetchTeachers: studentIds => dispatch(profileActions.fetchTeachersReq(studentIds)),
});

class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdown: false,
    };
  }

  setSfOAuthUrl = () => {
    const baseUrl = SF_OAUTH_AUTHORIZE_URL; // change test to login to move to production instance
    const redirect = `redirect_uri=${API_URL}/oauth/sf`;
    const scope = 'scope=id%20openid%20email%20profile%20api';
    const clientId = `client_id=${SF_OAUTH_ID.trim()}`;
    const prompt = 'prompt=consent%20login'; // '%20login' may be added
    const responseType = 'response_type=code'; 
    const oAuthUrl = `${baseUrl}?${redirect}&${scope}&${clientId}&${prompt}&${responseType}`;
    return oAuthUrl;
  }

  componentDidMount() {
    this.props.fetchMyProfile()
      .catch(console.error);  // eslint-disable-line
  }

  handleNavMenuClick = () => {
    const navDiv = document.getElementById('navbarSupportedContent');
    navDiv.classList.remove('show');
  }

  renderMentor = () => {
    return <li className="nav-item"><Link to="/mentor" className="nav-link">Mentor</Link></li>;
  }

  renderAdmin = () => {
    return <React.Fragment><li className="nav-item"><Link to="/mentor" className="nav-link">Mentor</Link></li><li className="nav-item"><Link to="/admin" className="nav-link">Admin</Link></li></React.Fragment>;
  }

  determineRole = () => {
    if (this.props.myProfile) {
      return this.props.myProfile.role === 'mentor' ? this.renderMentor() : this.renderAdmin();
    }
    return null;
  }

  renderJSX = (loggedIn) => {
    const JSXNotLoggedIn = (
      <React.Fragment>
        <Link to={routes.ROOT_ROUTE}><img className="rainier-logo" src={ rainierBtn } /></Link>
        <span className="login nav-content"><a href={ this.setSfOAuthUrl() }><img className="google-btn" src={ googleBtn } /></a></span>
      </React.Fragment>
    );

    const name = this.props.myProfile ? this.props.myProfile.firstName : null;

    const JSXLoggedIn = (
      <React.Fragment>
        <Link to={routes.ROOT_ROUTE}><img className="rainier-logo navbar-brand" src={ rainierBtn } /></Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent" onClick={this.handleNavMenuClick}>
          <ul className="navbar-nav mr-auto nav-content">
            {
              this.props.myProfile ? this.determineRole() : null
            }
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Welcome, { name }
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" onClick={ this.props.doLogout }>Logout</a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link help" href="https://docs.google.com/presentation/d/e/2PACX-1vTRSMVBEvObOl1sCKPmXMChP8A4eZScVmrRrzS6mDw0Imi5LkbFd1sSgqDS-QEPcBD-gvBFwmanrPIC/pub"alt="Help Documentation" target="_blank" rel="noopener noreferrer">Help</a>
            </li>
          </ul>
        </div>
      </React.Fragment>
    );

    return loggedIn ? JSXLoggedIn : JSXNotLoggedIn;
  }

  render() {
    const { loggedIn } = this.props;
    return (
      <header className="header">
        <nav className="navbar navbar-expand-lg navbar-dark">
          {this.renderJSX(loggedIn)}
        </nav>
      </header>
    );
  }
}

Navbar.propTypes = {
  loggedIn: PropTypes.bool,
  doLogout: PropTypes.func,
  fetchMyProfile: PropTypes.func,
  fetchProfiles: PropTypes.func,
  myProfile: PropTypes.object,
  fetchProfile: PropTypes.func,
  fetchStudents: PropTypes.func,
  fetchTeachers: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
