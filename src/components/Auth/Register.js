import React, { Component } from "react";
import { Grid, Form, Segment, Button, Header, Message, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import md5 from "md5";

import firebase from "../../firebase";

class Register extends Component {
    state = {
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        errors: [],
        loading: false,
        userRef: firebase.database().ref("users"),
    };
    /**
     * @param {event} event
     */
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };
    isformEmpty = ({ username, password, email, passwordConfirmation }) => {
        return (
            !username.length ||
            !email.length ||
            !password.length ||
            !passwordConfirmation.length
        );
    };

    isPasswordValid = ({ password, passwordConfirmation }) => {
        if (password.length < 6 || passwordConfirmation.length < 6) {
            return false;
        } else if (password !== passwordConfirmation) {
            return false;
        } else {
            return true;
        }
    };

    isFormValid = () => {
        let errors = [];
        let error;
        if (this.isformEmpty(this.state)) {
            error = { message: "Fill in all fields" };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else if (!this.isPasswordValid(this.state)) {
            error = { message: "Password is invalid" };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else {
            return true;
        }
    };

    displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

    /**
     * @param {event} event
     */
    handleSubmit = (event) => {
        event.preventDefault();
        if (this.isFormValid()) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then((createUser) => {
                    createUser.user
                        .updateProfile({
                            displayName: this.state.username,
                            photoURL: `http://gravatar.com/avatar/${md5(
                                createUser.user.email
                            )}?d=identicon`,
                        })
                        .then(() => {
                            this.saveUser(createUser).then(() => {
                                this.setState({ loading: false });
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                            this.setState({
                                errors: this.state.errors.concat(err),
                                loading: false,
                            });
                        });
                })
                .catch((error) => {
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(error),
                    });
                });
        }
    };

    saveUser = (createUser) => {
        return this.state.userRef.child(createUser.user.uid).set({
            name: createUser.user.displayName,
            avatar: createUser.user.photoURL,
        });
    };

    handleInputError = (errors, inputName) =>
        errors.some((error) => error.message.toLowerCase().includes(inputName))
            ? "error"
            : "";

    render() {
        const {
            username,
            email,
            password,
            passwodConfirmation,
            errors,
            loading,
        } = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h2" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange" />
                        Register for DevChat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input
                                fluid
                                name="username"
                                icon="user"
                                iconPosition="left"
                                placeholder="Username"
                                onChange={this.handleChange}
                                type="text"
                                className={this.handleInputError(errors, "username")}
                                value={username}
                            />
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
                            <Form.Input
                                fluid
                                name="passwordConfirmation"
                                icon="repeat"
                                iconPosition="left"
                                placeholder="Password Confirmation"
                                onChange={this.handleChange}
                                type="password"
                                className={this.handleInputError(errors, "password")}
                                value={passwodConfirmation}
                            />
                            <Button
                                className={loading ? "loading" : ""}
                                disabled={loading}
                                color="orange"
                                fluid
                                size="large"
                            >
                                Submit
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
                        Already a user? <Link to="/login">Login</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;
