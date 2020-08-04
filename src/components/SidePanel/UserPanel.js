import React, { Component } from "react";
import { Dropdown, Grid, Header, Icon, Image } from "semantic-ui-react";
import firebase from "../../firebase";

class UserPanel extends Component {
    state = {};
    dropdownOptions = () => {
        return [
            {
                key: "user",
                text: (
                    <span>
                        Signed in as <strong>{this.props.currentUser.displayName}</strong>
                    </span>
                ),
                disabled: true,
            },
            {
                key: "avatar",
                text: <span>Change Avatar</span>,
            },
            {
                key: "signout",
                text: <span onClick={this.handleSignOut}>Sign Out</span>,
            },
        ];
    };

    handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log("Sing out"));
    };

    render() {
        const { primaryColor } = this.props;
        return (
            <Grid style={{ background: `${primaryColor}` }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                    </Grid.Row>
                    <Header style={{ padding: "0.25em" }} as="h4" inverted>
                        <Dropdown
                            trigger={
                                <span>
                                    <Image
                                        src={this.props.currentUser.photoURL}
                                        spaced="right"
                                        avatar
                                    />
                                    {this.props.currentUser.displayName}
                                </span>
                            }
                            options={this.dropdownOptions()}
                        />
                    </Header>
                </Grid.Column>
            </Grid>
        );
    }
}

export default UserPanel;
