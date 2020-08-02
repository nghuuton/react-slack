import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import { BrowserRouter as Router, Switch, Route, withRouter } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import firebase from "./firebase";

import "semantic-ui-css/semantic.min.css";

import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { setUser } from "./actions/index";

import rootReducer from "./reducers";
import Spinner from "./Spinner";

const store = createStore(rootReducer, composeWithDevTools());

class Root extends Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.setUser(user);
                this.props.history.push("/");
            }
        });
    }
    render() {
        return this.props.isLoading ? (
            <Spinner />
        ) : (
            <Switch>
                <Route path="/" exact component={App} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
            </Switch>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.user.isLoading,
    };
};

const RootWithAuth = withRouter(connect(mapStateToProps, { setUser })(Root));

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth />
        </Router>
    </Provider>,
    document.getElementById("root")
);
