import React, { Component } from "react";
import { Segment, Header, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends Component {
    state = {};
    render() {
        const {
            channelName,
            numUniqueUsers,
            handleSearhChange,
            searchLoading,
            isPrivateChannel,
            handleStar,
            isChannelStarred,
        } = this.props;
        return (
            <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
                    <span>
                        {channelName}{" "}
                        {!isPrivateChannel && (
                            <Icon
                                onClick={handleStar}
                                name={isChannelStarred ? "star" : "star outline"}
                                color={isChannelStarred ? "yellow" : "black"}
                            />
                        )}
                    </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>
                <Header floated="right">
                    <Input
                        loading={searchLoading}
                        onChange={handleSearhChange}
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Message"
                    />
                </Header>
            </Segment>
        );
    }
}

export default MessagesHeader;
