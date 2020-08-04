import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import { connect } from "react-redux";
const App = ({
    currentUser,
    currentChannel,
    isPrivateChannel,
    userPosts,
    primaryColor,
    secondaryColor,
}) => {
    return (
        <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
            <ColorPanel key={currentUser && currentUser.name} currentUser={currentUser} />
            <SidePanel
                primaryColor={primaryColor}
                key={currentUser && currentUser.id}
                currentUser={currentUser}
            />
            <Grid.Column style={{ marginLeft: 320 }}>
                <Messages
                    key={currentChannel && currentChannel.name}
                    currentChannel={currentChannel}
                    currentUser={currentUser}
                    isPrivateChannel={isPrivateChannel}
                />
            </Grid.Column>
            <Grid.Column width={4}>
                <MetaPanel
                    key={currentChannel && currentChannel.name}
                    isPrivateChannel={isPrivateChannel}
                    currentChannel={currentChannel}
                    userPosts={userPosts}
                />
            </Grid.Column>
        </Grid>
    );
};

function mapStateToProps(state) {
    return {
        currentUser: state.user.currentUser,
        currentChannel: state.channel.currentChannel,
        isPrivateChannel: state.channel.isPrivateChannel,
        userPosts: state.channel.userPosts,
        primaryColor: state.colors.primaryColor,
        secondaryColor: state.colors.secondaryColor,
    };
}

export default connect(mapStateToProps)(App);
