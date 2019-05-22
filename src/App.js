import React, { Component, Fragment } from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./views/Home";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Switch>
        <Fragment>
          <div>
            <Switch>
              <Route exact path='/' component={Home}/>
            </Switch>
          </div>
        </Fragment>
      </Switch>
    );
  }
}

export default App;
