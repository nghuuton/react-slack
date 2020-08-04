import React, { Component } from "react";
import {
    Sidebar,
    Menu,
    Divider,
    Button,
    Modal,
    Icon,
    Label,
    Segment,
} from "semantic-ui-react";

import { SliderPicker } from "react-color";

import firebase from "../../firebase";
import { connect } from "react-redux";
import { setColors } from "../../actions/index";

class ColorPanel extends Component {
    state = {
        modal: false,
        primary: "",
        secondary: "",
        user: this.props.currentUser,
        userRef: firebase.database().ref("users"),
        userColors: [],
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListener(this.state.user.uid);
        }
    }

    componentWillMount() {
        this.removeListener();
    }

    removeListener = () => {
        this.state.userRef.child(`${this.state.user.uid}/colors`).off();
    };

    addListener = (userId) => {
        let userColors = [];
        this.state.userRef.child(`${userId}/colors`).on("child_added", (snap) => {
            userColors.push(snap.val());
            this.setState({ userColors });
        });
    };

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    handleChangePrimary = (color) => this.setState({ primary: color.hex });

    handleChangeSecondary = (color) => this.setState({ secondary: color.hex });

    handleSaveColors = () => {
        if (this.state.primary && this.state.secondary) {
            this.savecColors(this.state.primary, this.state.secondary);
        }
    };

    savecColors = (primary, secondary) => {
        this.state.userRef
            .child(`${this.state.user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary,
            })
            .then(() => {
                console.log("Colors added");
                this.closeModal();
            })
            .catch((err) => {
                console.error(err);
            });
    };

    displayUserColors = (colors) =>
        colors.length > 0 &&
        colors.map((color, i) => (
            <React.Fragment key={i}>
                <Divider />
                <div
                    className="color__container"
                    onClick={() => this.props.setColors(color.primary, color.secondary)}
                >
                    <div className="color__square" style={{ background: color.primary }}>
                        <div
                            className="color__overlay"
                            style={{ background: color.secondary }}
                        ></div>
                    </div>
                </div>
            </React.Fragment>
        ));

    render() {
        const { modal, primary, secondary, userColors } = this.state;

        return (
            <Sidebar as={Menu} icon="labeled" inverted vertical visible width="very thin">
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal} />
                {this.displayUserColors(userColors)}

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                        <Segment>
                            <Label content="Primary color" />
                            <SliderPicker
                                color={primary}
                                onChangeComplete={this.handleChangePrimary}
                            />
                        </Segment>
                        <Segment>
                            <Label content="Secondary color" />
                            <SliderPicker
                                color={secondary}
                                onChangeComplete={this.handleChangeSecondary}
                            />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.handleSaveColors} color="green" inverted>
                            <Icon name="checkmark" /> Save Colors
                        </Button>
                        <Button onClick={this.closeModal} color="red" inverted>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        );
    }
}

export default connect(null, { setColors })(ColorPanel);
