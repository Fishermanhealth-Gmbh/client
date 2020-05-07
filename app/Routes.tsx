import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import Suite from './containers/Suite';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path="*" component={Suite} />
      </Switch>
    </App>
  );
}
