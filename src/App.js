import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./views/Home";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Switch>
        <div>
          <Switch>
            <Route exact path='/' component={Home}/>
          </Switch>
        </div>
      </Switch>
    );
  }
}

export default App;
