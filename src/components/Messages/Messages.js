import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesForm from "./MessagesForm";
import MessagesHeader from "./MessagesHeader";

import firebase from "../../firebase";

class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref("messages"),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
    };
    render() {
        const { messagesRef, user, channel } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages"></Comment.Group>
                </Segment>
                <MessagesForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                />
            </React.Fragment>
        );
    }
}

export default Messages;
