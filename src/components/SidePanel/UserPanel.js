import React, { Component } from "react";
import {
    Dropdown,
    Grid,
    Header,
    Icon,
    Image,
    Modal,
    Input,
    Button,
} from "semantic-ui-react";
import firebase from "../../firebase";
class UserPanel extends Component {
    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: "",
        storageRef: firebase.storage().ref(),
    };
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
                text: <span onClick={this.openModal}>Change Avatar</span>,
            },
            {
                key: "signout",
                text: <span onClick={this.handleSignOut}>Sign Out</span>,
            },
        ];
    };

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log("Sing out"));
    };

    handleChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener("load", () => {
                this.setState({ previewImage: reader.result });
            });
        }
    };

    render() {
        const { user, modal, previewImage } = this.state;
        const { primaryColor } = this.props;
        return (
            <Grid style={{ background: `${primaryColor}` }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                        <Header style={{ padding: "0.25em" }} as="h4" inverted>
                            <Dropdown
                                trigger={
                                    <span>
                                        <Image
                                            src={user.photoURL}
                                            spaced="right"
                                            avatar
                                        />
                                        {user.displayName}
                                    </span>
                                }
                                options={this.dropdownOptions()}
                            />
                        </Header>
                    </Grid.Row>
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input
                                onChange={this.handleChange}
                                fluid
                                type="file"
                                label="New Avatar"
                                name="previewImage"
                            />
                            {/* <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid"></Grid.Column>
                                    <Grid.Column>Cropped Image Preview</Grid.Column>
                                </Grid.Row>
                            </Grid> */}
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color="green" inverted>
                                <Icon name="save" />
                                Change Avatar
                            </Button>
                            <Button color="green" inverted>
                                <Icon name="image" />
                                Preview
                            </Button>
                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove" />
                                Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        );
    }
}

export default UserPanel;
