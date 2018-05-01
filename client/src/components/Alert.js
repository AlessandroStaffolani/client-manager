import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from "prop-types";
import {withStyles} from "material-ui/styles/index";

function Alert(props) {
    const { vertical, horizontal, open, handleClose, message } = props;

    return (
        <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={open}
            onClose={handleClose}
            SnackbarContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{message}</span>}
        />
    )
}

export default Alert;