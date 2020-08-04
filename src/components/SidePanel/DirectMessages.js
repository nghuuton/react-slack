import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";

import firebase from "../../firebase";

import { setCurrentChannel, setPrivateChannel } from "../../actions/index";
import { connect } from "react-redux";

class DirectMessages extends Component {
    state = {
        activeChannel: "",
        user: this.props.currentUser,
        users: [],
        userRef: firebase.database().ref("users"),
        connectedRef: firebase.database().ref(".info/connected"),
        presencedRef: firebase.database().ref("presence"),
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillMount() {
        this.removeListeners();
    }

    removeListeners = () => {
        this.state.userRef.off();
        this.state.presencedRef.off();
        this.state.connectedRef.off();
    };

    addListeners = (currentUserUid) => {
        let loadedUsers = [];
        this.state.userRef.on("child_added", (snap) => {
            if (currentUserUid !== snap.key) {
                let user = snap.val();
                user["uid"] = snap.key;
                user["status"] = "offline";
                loadedUsers.push(user);
                this.setState({ users: loadedUsers });
            }
        });
        this.state.connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                const ref = this.state.presencedRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove((err) => {
                    if (err !== null) {
                        console.error(err);
                    }
                });
            }
        });
        this.state.presencedRef.on("child_added", (snap) => {
            if (currentUserUid !== snap.key) {
                // add status on user
                this.addStatusToUser(snap.key);
            }
        });
        this.state.presencedRef.on("child_removed", (snap) => {
            if (currentUserUid !== snap.key) {
                // add status on user
                this.addStatusToUser(snap.key, false);
            }
        });
    };

    addStatusToUser = (userId, connected = true) => {
        const updatedUser = this.state.users.reduce((acc, user) => {
            if (user.uid === userId) {
                user["status"] = `${connected ? "online" : "offline"}`;
            }
            return acc.concat(user);
        }, []);
        this.setState({ users: updatedUser });
    };

    isUserOnline = (user) => user.status === "online";

    changeChannel = (user) => {
        const channelId = this.getChannel(user.uid);
        const channelData = {
            id: channelId,
            name: user.name,
        };
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(user.uid);
    };

    getChannel = (userID) => {
        const currentUserId = this.state.user.uid;
        return userID < currentUserId
            ? `${userID}/${currentUserId}`
            : `${currentUserId}/${userID}`;
    };

    setActiveChannel = (userUID) => {
        this.setState({ activeChannel: userUID });
    };

    render() {
        const { users, activeChannel } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> DIRECT MESSAGES
                    </span>{" "}
                    ({users.length})
                </Menu.Item>
                {/* Users to Send Direct Message */}
                {users.map((user) => (
                    <Menu.Item
                        active={user.uid === activeChannel}
                        key={user.uid}
                        onClick={() => this.changeChannel(user)}
                        style={{ opacity: 0.7, fontStyle: "italic" }}
                    >
                        <Icon
                            name="circle"
                            color={this.isUserOnline(user) ? "green" : "red"}
                        />
                        @ {user.name}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        );
    }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(DirectMessages);
