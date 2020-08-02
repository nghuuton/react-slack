import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Message, Segment } from "semantic-ui-react";
import firebase from "../../firebase";

class Login extends Component {
    state = {
        email: "",
        password: "",
        errors: [],
        loading: false,
    };
    /**
     * @param {event} event
     */
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };

    displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

    /**
     * @param {event} event
     */
    handleSubmit = (event) => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then((sigInUser) => {
                    console.log(sigInUser);
                })
                .catch((err) => {
                    console.error(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        loading: false,
                    });
                });
        }
    };

    isFormValid = ({ email, password }) => email && password;

    handleInputError = (errors, inputName) =>
        errors.some((error) => error.message.toLowerCase().includes(inputName))
            ? "error"
            : "";

    render() {
        const { email, password, errors, loading } = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet" />
                        Login for DevChat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input
                                fluid
                                name="email"
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                onChange={this.handleChange}
                                type="email"
                                className={this.handleInputError(errors, "email")}
                                value={email}
                            />
                            <Form.Input
                                fluid
                                name="password"
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                onChange={this.handleChange}
                                type="password"
                                className={this.handleInputError(errors, "password")}
                                email={password}
                            />
                            <Button
                                className={loading ? "loading" : ""}
                                disabled={loading}
                                color="violet"
                                fluid
                                size="large"
                            >
                                Login
                            </Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>
                        Don't have account? <Link to="/register">Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Login;
