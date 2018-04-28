
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';


const styles = theme => ({
    root: theme.mixins.gutters({
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: theme.spacing.unit * 3,
    }),
    title: {
        marginBottom: theme.spacing.unit * 2
    }
});

function PaperSheet(props) {
    const { classes } = props;
    return (
        <div className={'overlay'}>
            <div className={'wrapper'}>
                <CircularProgress color="secondary" size={100} thickness={7}/>
            </div>
        </div>
    );
}

PaperSheet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PaperSheet);