import React, { Component } from "react";
import { Comment, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
import Message from "./Message";
import MessagesForm from "./MessagesForm";
import MessagesHeader from "./MessagesHeader";

class Messages extends Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessageRef: firebase.database().ref("privateMessage"),
        messagesRef: firebase.database().ref("messages"),
        userRef: firebase.database().ref("users"),
        channel: this.props.currentChannel,
        isChannelStarred: false,
        user: this.props.currentUser,
        messages: [],
        loading: true,
        progressBar: false,
        numUniqueUsers: "",
        searchTerm: "",
        searchLoading: false,
        searchResults: [],
    };

    componentDidMount() {
        const { channel, user } = this.state;
        if (channel && user) {
            this.addListeners(channel.id);
            this.addUserStarsListener(channel.id, user.uid);
        }
    }

    addUserStarsListener = (channelId, userId) => {
        this.state.userRef
            .child(userId)
            .child("starred")
            .once("value")
            .then((data) => {
                if (data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    this.setState({ isChannelStarred: prevStarred });
                }
            });
    };

    addListeners = (channelId) => {
        this.addMessageListenner(channelId);
    };

    addMessageListenner = (channelId) => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on("child_added", (snap) => {
            loadedMessages.push(snap.val());
            this.setState({ messages: loadedMessages, loading: false });
            this.countUniqueUsers(loadedMessages);
        });
    };

    getMessagesRef = () => {
        const { messagesRef, privateMessageRef, privateChannel } = this.state;
        return privateChannel ? privateMessageRef : messagesRef;
    };

    handleStar = () => {
        this.setState(
            (preState) => ({
                isChannelStarred: !preState.isChannelStarred,
            }),
            () => this.starChannel()
        );
    };

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.userRef.child(`${this.state.user.uid}/starred`).update({
                [this.state.channel.id]: {
                    name: this.state.channel.name,
                    details: this.state.channel.details,
                    createBy: {
                        name: this.state.channel.createBy.name,
                        avatar: this.state.channel.createBy.avatar,
                    },
                },
            });
        } else {
            this.state.userRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove((err) => {
                    if (err !== null) console.error(err);
                });
        }
    };

    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.leng > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers });
    };
    /**
     *
     * @param {Array} messages
     */

    displayMessages = (messages) =>
        messages.length > 0 &&
        messages.map((message) => (
            <Message key={message.timestamp} message={message} user={this.state.user} />
        ));

    isProgressBarVisible = (percent) => {
        if (percent > 0) {
            this.setState({ progressBar: true });
        }
    };

    displayChannelName = (channel) => {
        return channel ? `${this.state.privateChannel ? "@ " : "# "}${channel.name}` : "";
    };

    handleSearhChange = (event) => {
        this.setState({ searchTerm: event.target.value, searchLoading: true }, () => {
            this.handleSearchMessage();
        });
    };

    handleSearchMessage = () => {
        const channelMessage = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, "gi");
        console.log(this.state.searchTerm);
        const searchResults = channelMessage.reduce((acc, message) => {
            if (
                (message.content && message.content.match(regex)) ||
                message.user.name.match(regex)
            ) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(() => {
            this.setState({ searchLoading: false });
        }, 1000);
    };

    render() {
        const {
            messagesRef,
            user,
            channel,
            messages,
            progressBar,
            numUniqueUsers,
            searchTerm,
            searchResults,
            searchLoading,
            privateChannel,
            isChannelStarred,
        } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearhChange={this.handleSearhChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                />
                <Segment>
                    <Comment.Group
                        className={progressBar ? "messages__progress" : "messages"}
                    >
                        {searchTerm
                            ? this.displayMessages(searchResults)
                            : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessagesForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        );
    }
}

export default Messages;
