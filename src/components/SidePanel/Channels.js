import React, { Component } from "react";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";

import firebase from "../../firebase";

class Channels extends Component {
    state = {
        channels: [],
        channelName: "",
        channelDetails: "",
        channelRef: firebase.database().ref("channels"),
        modal: false,
    };

    componentDidMount() {
        let loadedChannels = [];
        this.state.channelRef.on("child_added", (snap) => {
            loadedChannels.push(snap.val());
            console.log(loadedChannels);
            this.setState({ channels: loadedChannels });
        });
    }

    closeModal = () => {
        this.setState({ modal: false });
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    openModal = () => {
        this.setState({ modal: true });
    };

    addChannel = () => {
        const { channelName, channelDetails, channelRef } = this.state;

        const key = channelRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createBy: {
                name: this.props.currentUser.displayName,
                avatar: this.props.currentUser.photoURL,
            },
        };
        channelRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: "", channelDetails: "" });
                this.closeModal();
            })
            .catch((err) => {
                console.error(err);
            });
    };

    closeModal = () => {
        this.setState({ modal: false });
    };

    handleSumbit = (event) => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.addChannel();
        }
    };

    isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

    displayChannels = (channels) =>
        channels.length > 0
            ? channels.map((channel) => (
                  <Menu.Item
                      key={channel.id}
                      onClick={() => console.log(channel)}
                      name={channel.name}
                      style={{ opacity: 0.7 }}
                  >
                      # {channel.name}
                  </Menu.Item>
              ))
            : null;

    render() {
        const { channels, modal } = this.state;
        return (
            <React.Fragment>
                <Menu.Menu style={{ paddingBottom: "2em" }}>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>{" "}
                        ({channels.length}) <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSumbit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="About of channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSumbit}>
                            <Icon name="checkmark" /> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    }
}

export default Channels;
