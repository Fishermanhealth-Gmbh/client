import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import App from './containers/App';
import Suite from './containers/Suite';
const A = App as any;

export default function Routes() {
  return (
    <A>
      <Switch>
        <Route path="/" component={Suite} />
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </A>
  );
}
