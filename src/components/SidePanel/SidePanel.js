import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

class SidePanel extends Component {
    render() {
        const { primaryColor } = this.props;
        return (
            <Menu
                size="large"
                inverted
                fixed="left"
                vertical
                style={{ background: `${primaryColor}`, fontSie: "1.2rem" }}
            >
                <UserPanel
                    primaryColor={primaryColor}
                    currentUser={this.props.currentUser}
                />
                <Starred currentUser={this.props.currentUser} />
                <Channels currentUser={this.props.currentUser} />
                <DirectMessages currentUser={this.props.currentUser} />
            </Menu>
        );
    }
}

export default SidePanel;
