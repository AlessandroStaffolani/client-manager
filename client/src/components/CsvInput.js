
import React from 'react';
import Papa from 'papaparse';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import FileUpload from '@material-ui/icons/FileUpload';
import FileDownload from '@material-ui/icons/FileDownload';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Tooltip from 'material-ui/Tooltip';
import Grid from 'material-ui/Grid';
import Modal from 'material-ui/Modal';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    button: {
        margin: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    fileName: {
        display: 'inline-block',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200
    },
    gridItem: {
        padding: 20,
    },
});


class IconLabelButtons extends React.Component {

    render(){
        const {classes, csvConfig, canExecute, canDownload} = this.props;
        return (
            <div className={classes.root}>
                <form noValidate autoComplete="off">
                    <Grid className={classes.container} container spacing={0} justify={'center'} alignContent={'center'} alignItems={'center'}>
                        {/*<Grid className={classes.gridItem} item xs={12} sm={4} zeroMinWidth>
                            <TextField
                                id="delimiter"
                                label="Delimiter"
                                className={classes.textField}
                                value={csvConfig.delimiter}
                                onChange={this.props.handleInputChange('delimiter')}
                                margin="normal"
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={12} sm={4} zeroMinWidth>
                            <TextField
                                id="newline"
                                label="New Line"
                                className={classes.textField}
                                value={csvConfig.newline}
                                onChange={this.props.handleInputChange('newline')}
                                margin="normal"
                            />
                        </Grid>
                        <Grid className={classes.gridItem} item xs={12} sm={4} zeroMinWidth>
                            <TextField
                                id="escapeChar"
                                label="Escape Char"
                                className={classes.textField}
                                value={csvConfig.escapeChar}
                                onChange={this.props.handleInputChange('escapeChar')}
                                margin="normal"
                            />
                        </Grid>*/}
                        <Grid className={classes.gridItem} item xs={12} sm={4} md={4} zeroMinWidth>
                            <input
                                className={classes.input}
                                id="raised-button-file"
                                type="file"
                                onChange={this.props.handleFileInput}
                                accept=".csv"
                            />
                            <label htmlFor="raised-button-file">
                                <Button
                                    disabled={this.props.execution}
                                    className={classes.button}
                                    variant="raised"
                                    component="span"
                                    color="secondary"
                                    fullWidth={true}
                                >
                                    Carica il file CSV con i dati dei Clienti
                                    <FileUpload className={classes.rightIcon}/>
                                </Button>
                            </label>
                        </Grid>
                        <Grid className={classes.gridItem} item xs={12} sm={3} md={3} zeroMinWidth>
                            {this.props.file !== null ?
                                <Typography className={classes.fileName} variant={'subheading'} gutterBottom>
                                    File: <b>{this.props.file.name}</b>
                                </Typography> : ''}
                        </Grid>
                        <Grid className={classes.gridItem} item xs={12} sm={4} md={4} zeroMinWidth>
                            <Tooltip id={'tooltip-db'} title={"Carica i clienti dal database se hai già importato una volta dal CSV"}>
                                <Button
                                    id={'db'}
                                    className={classes.button}
                                    color={'primary'}
                                    fullWidth={true}
                                    variant={'raised'}
                                    onClick={this.props.handleCloudLoad}
                                >
                                    Carica dal Database
                                    <CloudDownloadIcon className={classes.rightIcon}/>
                                </Button>
                            </Tooltip>
                        </Grid>
                        <Grid item className={classes.gridItem} xs={12} sm={4} md={4} zeroMinWidth>
                            {canExecute ? (
                                <Tooltip id="tooltip-execute" title="Utilizza i motori di Google Maps per cercare l'indirizzo, la latitudine e la logitudine delle aziende sconosciute">
                                    <Button
                                        id={'execute'}
                                        variant="raised"
                                        color="default"
                                        className={classes.button}
                                        fullWidth={true}
                                        onClick={this.props.handlePlacesButton}
                                    >
                                        Trova indirizzi
                                        <MyLocationIcon className={classes.rightIcon}/>
                                    </Button>
                                </Tooltip>
                            ) : ''}
                            {canDownload ? (
                                <Tooltip id="tooltip-download" title="Scarica il CSV aggiornato">
                                    <Button
                                        id={'download'}
                                        variant="raised"
                                        color="default"
                                        className={classes.button}
                                        fullWidth={true}
                                        onClick={this.props.handleDownload}
                                    >
                                        Scarica CSV
                                        <FileDownload className={classes.rightIcon}/>
                                    </Button>
                                </Tooltip>
                            ) : ''}
                        </Grid>
                    </Grid>

                </form>
            </div>
        );
    }
}

IconLabelButtons.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IconLabelButtons);