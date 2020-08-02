import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import firebase from "./firebase";

import "semantic-ui-css/semantic.min.css";

class Root extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/" exact component={App} />
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                </Switch>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<Root />, document.getElementById("root"));
