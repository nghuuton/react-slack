import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";

import { setCurrentChannel, setPrivateChannel } from "../../actions/index";
import { connect } from "react-redux";

import firebase from "../../firebase";

class Starred extends Component {
    state = {
        user: this.props.currentUser,
        userRef: firebase.database().ref("users"),
        starredChannels: [],
        activeChannel: "",
    };

    componentDidMount() {
        if (this.state.user.uid) {
            this.addListeners(this.state.user.uid);
        }
    }

    addListeners = (userId) => {
        this.state.userRef
            .child(userId)
            .child("starred")
            .on("child_added", (snap) => {
                const starredChannel = { id: snap.key, ...snap.val() };
                this.setState({
                    starredChannels: [...this.state.starredChannels, starredChannel],
                });
            });

        this.state.userRef
            .child(userId)
            .child("starred")
            .on("child_removed", (snap) => {
                const channelToRemove = { id: snap.key, ...snap.val() };
                const filteredChannels = this.state.starredChannels.filter((channel) => {
                    return channel.id !== channelToRemove.id;
                });
                this.setState({ starredChannels: filteredChannels });
            });
    };

    setActiveChannel = (channel) => {
        this.setState({ activeChannel: channel.id });
    };

    changeChannel = (channel) => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    };

    displayChannels = (starredChannels) =>
        starredChannels.length > 0
            ? starredChannels.map((channel) => (
                  <Menu.Item
                      key={channel.id}
                      onClick={() => this.changeChannel(channel)}
                      name={channel.name}
                      style={{ opacity: 0.7 }}
                      active={channel.id === this.state.activeChannel}
                  >
                      # {channel.name}
                  </Menu.Item>
              ))
            : null;

    render() {
        const { starredChannels } = this.state;
        return (
            <Menu.Menu>
                <Menu.Item>
                    <span>
                        <Icon name="star" /> STARRED
                    </span>{" "}
                    ({starredChannels.length})
                    <Icon name="add" onClick={this.openModal} />
                </Menu.Item>
                {this.displayChannels(starredChannels)}
            </Menu.Menu>
        );
    }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
