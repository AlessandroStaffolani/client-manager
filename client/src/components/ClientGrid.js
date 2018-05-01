import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, {
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
} from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import { lighten } from 'material-ui/styles/colorManipulator';
import TextField from 'material-ui/TextField';
import FilterListIcon from '@material-ui/icons/FilterList';
import Grid from 'material-ui/Grid';

class EnhancedTableHead extends React.Component {

    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {order, orderBy, columns } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {columns.map(column => {
                        return (
                            <TableCell
                                key={column.id}
                                padding='default'
                                sortDirection={orderBy === column.code ? order : false}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement='bottom-start'
                                >
                                    <TableSortLabel
                                        active={orderBy === column.code}
                                        direction={order}
                                        onClick={this.createSortHandler(column.code)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit,
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
});

class EnhancedTableToolbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filtering: false
        };

        this.handleFilterIconClick = this.handleFilterIconClick.bind(this);
    }

    handleFilterIconClick = () => {
        this.setState({
            filtering: !this.state.filtering
        })
    };

    render() {
        const { classes, search, handleSearchChange } = this.props;

        return (
            <Toolbar
                className={classNames(classes.root)}
            >
                <Grid container spacing={0} justify={'space-between'} alignItems={'center'} >
                    <Grid item xs={5} md={8}>
                        <Typography variant="title">Clienti</Typography>
                    </Grid>
                    <Grid item xs={7} md={4}>
                        {this.state.filtering ? (
                                <Grid container spacing={8} alignContent={'flex-end'} alignItems="flex-end" justify={"flex-end"}>
                                    <Grid item xs={8}>
                                        <TextField id="search" name={"search"} value={search} onChange={handleSearchChange} label="Search" />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Tooltip title="Filter list">
                                            <IconButton aria-label="Filter list" onClick={this.handleFilterIconClick}>
                                                <FilterListIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            ) :
                            (
                                <Grid container spacing={8} alignContent={'flex-end'} alignItems="flex-end" justify={"flex-end"}>
                                    <Grid item xs={4}>
                                        <Tooltip title="Filter list">
                                            <IconButton aria-label="Filter list" onClick={this.handleFilterIconClick}>
                                                <FilterListIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            )}
                    </Grid>
                </Grid>
            </Toolbar>
        );
    }
}

EnhancedTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

class EnhancedTable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            order: 'asc',
            orderBy: 'company',
            page: 0,
            rowsPerPage: 10,
            rowsPerPageOptions: [10, 25, 50]
        };
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        const data =
            order === 'desc'
                ? this.props.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
                : this.props.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

        this.setState({ data, order, orderBy });
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    render() {
        const { classes, data } = this.props;
        const { order, orderBy, rowsPerPage, page } = this.state;
        const columnData = this.props.header;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

        let counterRow = 0;
        let counterCell = 0;

        return (
            <Paper className={classes.root}>
                <EnhancedTableToolbar search={this.props.search} handleSearchChange={this.props.handleSearchChange}/>
                <div className={classes.tableWrapper}>
                    <Table className={classes.table}>
                        <EnhancedTableHead
                            columns={columnData}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={this.handleRequestSort}
                            rowCount={data.length}
                        />
                        <TableBody>
                            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {
                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={counterRow++}
                                    >
                                        {columnData.map(item =>
                                            <TableCell
                                                key={counterCell++}
                                                padding="default"
                                            >
                                                {n[item.code]}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 49 * emptyRows }}>
                                    <TableCell colSpan={columnData.length + 1} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    rowsPerPageOptions={this.state.rowsPerPageOptions}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
            </Paper>
        );

    }
}

EnhancedTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedTable);