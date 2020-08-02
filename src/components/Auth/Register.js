import React, { Component } from "react";
import { Grid, Form, Segment, Button, Header, Message, Icon } from "semantic-ui-react";

import { Link } from "react-router-dom";

import firebase from "../../firebase";

class Register extends Component {
    state = {
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
    };
    /**
     * @param {event} event
     */
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };

    /**
     * @param {event} event
     */
    handleSubmit = (event) => {
        event.preventDefault();
        const dataToSubmit = {};
        for (let key in this.state) {
            if (key !== "passwordConfirmation") {
                dataToSubmit[key] = this.state[key];
            }
        }
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then((createUser) => {
                console.log(createUser);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    render() {
        const { username, email, password, passwodConfirmation } = this.state;
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
                                value={passwodConfirmation}
                            />
                            <Button color="orange" fluid size="large">
                                Submit
                            </Button>
                        </Segment>
                    </Form>
                    <Message>
                        Already a user? <Link to="/login">Login</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;
