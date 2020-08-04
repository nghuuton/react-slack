import React, { Component } from "react";
import { Menu, Icon, Modal, Form, Input, Button, Label } from "semantic-ui-react";

import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";

class Channels extends Component {
    state = {
        channel: null,
        channels: [],
        channelName: "",
        channelDetails: "",
        channelRef: firebase.database().ref("channels"),
        messagesRef: firebase.database().ref("messages"),
        typingRef: firebase.database().ref("typing"),
        notifications: [],
        modal: false,
        firstLoad: true,
        activeChannel: "",
    };

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelRef.on("child_added", (snap) => {
            loadedChannels.push(snap.val());
            this.setState({ channels: loadedChannels }, () => {
                this.setFirstChannel();
            });
            this.addNotificationListener(snap.key);
        });
    };

    addNotificationListener = (channelId) => {
        this.state.messagesRef.child(channelId).on("value", (snap) => {
            if (this.state.channel) {
                this.handleNotifications(
                    channelId,
                    this.state.channel.id,
                    this.state.notifications,
                    snap
                );
            }
        });
    };

    /**
     *
     * @param {String} channelId
     * @param {String} currentChannelId
     * @param {Array} notifications
     */
    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;
        let index = notifications.findIndex(
            (notification) => notification.id === channelId
        );
        if (index !== -1) {
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total;
                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnowTotal = snap.numChildren();
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnowTotal: snap.numChildren(),
                count: 0,
            });
        }
        this.setState({ notifications });
    };

    removeListeners = () => {
        this.state.channelRef.off();
    };

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel });
        }
        this.setState({ firstLoad: false });
    };

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

    getNotificationCount = (channel) => {
        let count = 0;
        this.state.notifications.forEach((notification) => {
            if (notification.id === channel.id) {
                count = notification.count;
            }
        });
        if (count > 0) return count;
    };

    displayChannels = (channels) =>
        channels.length > 0
            ? channels.map((channel) => (
                  <Menu.Item
                      key={channel.id}
                      onClick={() => this.changeChannel(channel)}
                      name={channel.name}
                      style={{ opacity: 0.7 }}
                      active={channel.id === this.state.activeChannel}
                  >
                      {this.getNotificationCount(channel) && (
                          <Label color="red">{this.getNotificationCount(channel)}</Label>
                      )}
                      # {channel.name}
                  </Menu.Item>
              ))
            : null;

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(
            (notification) => notification.id === this.state.channel.id
        );
        if (index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[
                index
            ].lastKnowTotal;
            updatedNotifications[index].count = 0;
            this.setState({ notifications: updatedNotifications });
        }
    };

    changeChannel = (channel) => {
        this.setActiveChannel(channel);
        this.state.typingRef.child(channel.id).child(this.props.currentUser.uid).remove();
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel });
    };

    setActiveChannel = (channel) => {
        this.setState({ activeChannel: channel.id });
    };

    render() {
        const { channels, modal } = this.state;
        return (
            <React.Fragment>
                <Menu.Menu className="menu">
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

export default connect(null, { setCurrentChannel, setPrivateChannel })(Channels);
