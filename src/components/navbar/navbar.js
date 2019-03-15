import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { cookieFetch } from '../../lib/utils';
import * as authActions from '../../actions/auth';
import * as refreshActions from '../../actions/refresh';
import * as routes from '../../lib/routes';
// import googleBtn from '../../assets/google-btn.png';
import rainierBtn from '../../assets/rainier-logo-horizontal.png';

import './_navbar.scss';

import * as profileActions from '../../actions/profile';

const mapStateToProps = state => ({
  loggedIn: !!state.token,
  myProfile: state.myProfile,
});

const mapDispatchToProps = dispatch => ({
  doLogout: () => dispatch(authActions.logout()),
  fetchMyProfile: profile => dispatch(profileActions.fetchMyProfileReq(profile)),
  useRefreshToken: token => dispatch(refreshActions.useRefreshToken(token)),
});

class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdown: false,
    };
  }

  setSFOAuthUrl = () => {
    const baseUrl = SF_OAUTH_AUTHORIZE_URL; // change test to login to move to production instance
    const redirect = `redirect_uri=${API_URL}/oauth/sf`;
    const scope = 'id'; 
    const clientId = `client_id=${SF_OAUTH_ID.trim()}`;
    const prompt = 'prompt=consent%20login'; 
    const responseType = 'response_type=code'; 
    const oAuthUrl = `${baseUrl}?${redirect}&${scope}&${clientId}&${prompt}&${responseType}`;
    return oAuthUrl;
  }

  setBCOAuthUrl = () => {
    const baseUrl = BC_OAUTH_AUTHORIZE_URL;
    const type = 'type=web_server';
    const clientId = `client_id=${BC_OAUTH_ID.trim()}`;
    const redirect = `redirect_uri=${API_URL}/oauth/bc`;
    const oAuthUrl = `${baseUrl}?${type}&${clientId}&${redirect}`;
    return oAuthUrl;
  }

  componentDidMount() {
    // if (!this.props.loggedIn && cookieFetch('RaRefresh')) {
    //   this.props.useRefreshToken(cookieFetch('RaRefresh'));
    //   return null;
    // }
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

  determineRole = () => {
    if (this.props.myProfile) {
      return this.renderMentor();
    }
    return null;
  }

  renderJSX = (loggedIn) => {
    const JSXNotLoggedIn = (
      <React.Fragment>
        <Link to={routes.ROOT_ROUTE}><img className="rainier-logo" src={ rainierBtn } /></Link>
        <span className="login nav-content"><a href={ this.setSFOAuthUrl() } className="btn btn-primary">Sign In</a></span>
      </React.Fragment>
    );

    const name = this.props.myProfile ? this.props.myProfile.firstName : null;

    const JSXLoggedIn = (
      <React.Fragment>
        <Link to={routes.ROOT_ROUTE}><img className="rainier-logo navbar-brand" src={ rainierBtn } /></Link>
        <div>
          <h3>Welcome {name}</h3>
        </div>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent" onClick={this.handleNavMenuClick}>
          <ul className="navbar-nav mr-auto nav-content">
            {
              this.props.myProfile ? this.determineRole() : null
            }
            <li className="nav-item"><a className="nav-link" onClick={ this.props.doLogout }>Logout</a></li>
            <li className="nav-item">
              <a className="nav-link help" href="https://docs.google.com/presentation/d/e/2PACX-1vTRSMVBEvObOl1sCKPmXMChP8A4eZScVmrRrzS6mDw0Imi5LkbFd1sSgqDS-QEPcBD-gvBFwmanrPIC/pub"alt="Help Documentation" target="_blank" rel="noopener noreferrer">Help</a>
            </li>
            <li className="nav-item">
              <a className="nav-link"
                href={ this.setBCOAuthUrl() }>Basecamp Login</a>
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
  useRefreshToken: PropTypes.func,
  myProfile: PropTypes.object,
  fetchProfile: PropTypes.func,
  fetchStudents: PropTypes.func,
  fetchTeachers: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
