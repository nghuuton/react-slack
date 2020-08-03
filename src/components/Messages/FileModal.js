import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";

class FileModal extends Component {
    state = {};
    render() {
        const { modal, closeModal } = this.props;
        return (
            <Modal basic open={modal} onClick={closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input fluid label="File types: jpg, png" name="file" type="file" />
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted>
                        <Icon name="checkmark" /> Send
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileModal;
