import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPhone, faAt, faUser, faKey, faBirthdayCake, faSchool, faSpinner, faCopy, faInfoCircle} from '@fortawesome/free-solid-svg-icons'; //eslint-disable-line

import AuthRedirect from '../auth-redirect/auth-redirect';
import Mentor from '../mentor/mentor';
import Navbar from '../navbar/navbar';
import Dashboard from '../dashboard/dashboard';
import Auth from '../auth/auth';

import * as routes from '../../lib/routes';

import './_app.scss';

library.add(faPhone, faAt, faUser, faKey, faBirthdayCake, faSchool, faSpinner, faCopy, faInfoCircle);

const MentorUser = Auth(['mentor', 'admin']);

const Footer = () => (
  <footer className="footer">
    <p><a className="footer-link" href="https://www.rainierathletes.org" alt="Link to Rainier Athletes website">©2018 Rainier Athletes</a></p>
  </footer>
);

export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <Helmet>
          <meta charSet="utf-8"/>
          <title>Rainier Athletes Mentor Portal</title>
          <meta name="description" content=""/>
          <meta name="author" content="Jess Franklin, ED"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>

        </Helmet>
        <BrowserRouter>
          <div>
            <Navbar />
            <Dashboard />
            <Route exact path="*" component={AuthRedirect} />
            <Route exact path={routes.MENTOR_ROUTE} component={ MentorUser(Mentor) } />
          </div>
        </BrowserRouter>
        <Footer />
      </div>
    );
  }
}
