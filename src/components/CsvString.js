import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';

const styles = theme => ({
    paper: {
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
});

class CsvString extends React.Component {

    render() {
        const { classes } = this.props;

        return (
            <div>
                <TextField
                    id="multiline-flexible"
                    multiline
                    rowsMax="10"
                    value={this.props.csvString}
                    disabled={true}
                    margin="normal"
                    fullWidth={true}
                />
            </div>
        );
    }
}

CsvString.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CsvString);
