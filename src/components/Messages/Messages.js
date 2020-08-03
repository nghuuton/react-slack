import React, { Component } from "react";
import { Comment, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
import Message from "./Message";
import MessagesForm from "./MessagesForm";
import MessagesHeader from "./MessagesHeader";

class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref("messages"),
        channel: this.props.currentChannel,
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
        }
    }

    addListeners = (channelId) => {
        this.addMessageListenner(channelId);
    };

    addMessageListenner = (channelId) => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on("child_added", (snap) => {
            loadedMessages.push(snap.val());
            this.setState({ messages: loadedMessages, loading: false });
            this.countUniqueUsers(loadedMessages);
        });
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

    displayChannelName = (channel) => (channel ? `# ${channel.name}` : "");

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
        } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearhChange={this.handleSearhChange}
                    searchLoading={searchLoading}
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
                />
            </React.Fragment>
        );
    }
}

export default Messages;
