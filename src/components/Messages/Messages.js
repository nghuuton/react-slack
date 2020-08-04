import React, { Component } from "react";
import { Comment, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
import Message from "./Message";
import MessagesForm from "./MessagesForm";
import MessagesHeader from "./MessagesHeader";
import { connect } from "react-redux";

import { setUserPosts } from "../../actions/index";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

class Messages extends Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessageRef: firebase.database().ref("privateMessage"),
        messagesRef: firebase.database().ref("messages"),
        userRef: firebase.database().ref("users"),
        typingRef: firebase.database().ref("typing"),
        connectedref: firebase.database().ref(".info/connected"),
        typingUsers: [],
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
        listeners: [],
    };

    componentDidMount() {
        const { channel, user, listeners } = this.state;
        if (channel && user) {
            this.removeListeners(listeners);
            this.addListeners(channel.id);
            this.addUserStarsListener(channel.id, user.uid);
        }
    }

    componentWillMount() {
        this.props.setUserPosts({});
        this.state.userRef.off("value", () => {
            console.log("Cancel firebase");
        });
        this.removeListeners(this.state.listeners);
        this.state.connectedref.off();
    }

    removeListeners = (listeners) => {
        listeners.forEach((listener) => {
            listener.ref.child(listener.id).off(listener.event);
        });
    };

    addToListner = (id, ref, event) => {
        const index = this.state.listeners.findIndex((listener) => {
            return listener.id === id && listener.ref === ref && listener.event === event;
        });
        if (index !== -1) {
            const newListners = { id, ref, event };
            this.setState({ listeners: this.state.listeners.concat(newListners) });
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.messageEnd) {
            this.scrollToBotto();
        }
    }

    scrollToBotto = () => {
        this.messageEnd.scrollIntoView({ behavior: "smooth" });
    };

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
        this.addTypingListeners(channelId);
    };

    addTypingListeners = (channelId) => {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on("child_added", (snap) => {
            if (snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val(),
                });
            }
            this.setState({ typingUsers });
        });
        this.addToListner(channelId, this.state.typingRef, "child_added");
        this.state.typingRef.child(channelId).on("child_removed", (snap) => {
            const index = typingUsers.findIndex((user) => user.id === snap.key);
            if (index !== -1) {
                typingUsers = typingUsers.filter((user) => user.id !== snap.key);
                this.setState({ typingUsers });
            }
        });
        this.addToListner(channelId, this.state.typingRef, "child_removed");

        this.state.connectedref.on("value", (snap) => {
            if (snap.val() !== true) {
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove((err) => {
                        if (err !== null) console.error(err);
                    });
            }
        });
    };

    addMessageListenner = (channelId) => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on("child_added", (snap) => {
            loadedMessages.push(snap.val());
            this.setState({ messages: loadedMessages, loading: false });
            this.countUniqueUsers(loadedMessages);
            this.countUsersPosts(loadedMessages);
        });
        this.addToListner(channelId, ref, "child_added");
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
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers });
    };

    countUsersPosts = (messages) => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1,
                };
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
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

    displayTypingUser = (users) =>
        users.length > 0 &&
        users.map((user) => (
            <div
                style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
                key={user.id}
            >
                <span className="user__typing">{user.name} is typing</span>
                <Typing />
            </div>
        ));

    displayMessageSkeleton = (loading) =>
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} />
                ))}
            </React.Fragment>
        ) : null;

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
            typingUsers,
            loading,
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
                <Segment inverted color="grey">
                    <Comment.Group
                        className={progressBar ? "messages__progress" : "messages"}
                    >
                        {this.displayMessageSkeleton(loading)}
                        {searchTerm
                            ? this.displayMessages(searchResults)
                            : this.displayMessages(messages)}
                        {this.displayTypingUser(typingUsers)}
                        <div ref={(node) => (this.messageEnd = node)}></div>
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

export default connect(null, { setUserPosts })(Messages);
