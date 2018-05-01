import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import '../index.css';
import CsvInput from './CsvInput';
import SimpleAppBar from './SimpleAppBar';
import ClientGrid from './ClientGrid';
import Papa from "papaparse";
import { readInputFile, reformatCsvData, createCsvFile } from '../utilities/csvUtility';
import { composeAddress } from '../utilities/addressUtility';
import { findPlace, findPlaceById } from '../google/find-place';
import { config } from '../google/config';
import { Map } from '../google/Map';
import GoogleApiComponent from '../google/GoogleApiComponent';
import Progress from './Progress';
import Marker from '../google/components/Marker';
import CsvString from './CsvString';
import path from 'path';
import Typography from 'material-ui/Typography';
import { globalConfig } from '../globalConfig';
import Alert from './Alert';


const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#757ce8',
            main: '#3f50b5',
            dark: '#002884',
            contrastText: '#fff',
        },
        secondary: {
            light: '#EF9A9A',
            main: '#ff7961',
            dark: '#f44336',
            contrastText: '#000',
        },
    },
});

const API_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

const DEFAULT_DELIMITER = ',';
const DEFAULT_NEWLINE = '';
const DEFAULT_ESCAPECHAR = '';
const DEFAULT_DOWNLOAD_LOCATION = path.join(__dirname, '..', '..', 'downloads', 'clienti.csv');
const ADDRESS_TYPES = [
    'route',
    'street_number'
];

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            header: [],
            fileData: [],
            data: [],
            dataMarkers: [],
            selected: [],
            file: null,
            search: '',
            canExecute: false,
            execution: false,
            canDownload: false,
            canShowCsvToDownload: false,
            showAlert: false,
            alertMessage: '',
            alertVertical: 'bottom',
            alertHorizontal: 'center',
            csvString: '',
            companyProcessed: {
                total: 0,
                founded: 0,
                notFounded: 0,
                notExecuted: 0,
            },
            csvConfig: {
                delimiter: DEFAULT_DELIMITER,
                newline: DEFAULT_NEWLINE,
                quoteChar: DEFAULT_ESCAPECHAR,
                escapeChar: DEFAULT_ESCAPECHAR,
            }
        };
        this.handleCloseAlerts = this.handleCloseAlerts.bind(this);
        this.handleData = this.handleData.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handlePlacesButton = this.handlePlacesButton.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.handleCloudLoad = this.handleCloudLoad.bind(this);
    }

    handleCloseAlerts = () => {
        this.setState({ showAlert: false });
    };

    handleData = data => {
        for (let i = 0; i < data.length; i++) {
            data[i].id = i;
        }
        this.setState({ data });
    };

    handleSearchChange = event => {
        let searchValue = event.target.value;
        let data = this.state.fileData;
        let newData = [];

        data.forEach(row => {
            let mantain = false;
            Object.keys(row).forEach(k => {
                if (row[k] !== null) {
                    if (row[k].toString().toLowerCase().includes(searchValue.toLowerCase())) {
                        mantain = true;
                    }
                }
            });
            if (mantain) {
                newData.push(row);
            }
        });

        this.setState({
            search: searchValue,
            data: newData
        });
    };

    handleInputChange = name => event => {
        let config = {
            delimiter: DEFAULT_DELIMITER,
            newline: DEFAULT_NEWLINE,
            quoteChar: DEFAULT_ESCAPECHAR,
            escapeChar: DEFAULT_ESCAPECHAR,
        };
        config[name] = event.target.value;
        this.setState({
            csvConfig: config
        })
    };

    handleFileInput = event => {
        event.preventDefault();

        this.setState({
            execution: true,
        });

        let file = event.target.files[0];
        let csvData = undefined;

        let fileReaderPromise = readInputFile(file);
        fileReaderPromise
            .then((csv) => {
                csvData = Papa.parse(csv, this.csvConfig);
                csvData = reformatCsvData(csvData.data);

                let apiPath = globalConfig.host + globalConfig.apiName + 'post/data';

                let saveDataPromise = fetch(apiPath, {
                    method: 'POST',
                    headers: API_HEADERS,
                    body: JSON.stringify({
                        data: csvData.data,
                    })
                })
                    .then(result => result.json())
                    .then(response => {
                        this.setState({
                            file: file,
                            header: response.header,
                            data: response.data,
                            fileData: response.data,
                            canExecute: true,
                            canDownload: false,
                            canShowCsvToDownload: false,
                            execution: false,
                        });

                        this.setMarkers();
                    })
                    .catch(reason => console.log(reason));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    setMarkers = () => {
        const { fileData } = this.state;
        let markers = [];
        fileData.map((client, id) => {
            if (client.latitude !== null && client.longitude !== null) {
                markers.push({
                    id: id,
                    title: client.company,
                    position: {lat: client.latitude, lng: client.longitude}
                })
            }
        });

        this.setState({
            dataMarkers: markers
        })
    };

    handleCloudLoad = () => {

        this.setState({
            execution: true,
        });

        let dataPromise = fetch(globalConfig.host + globalConfig.apiName + 'get/data', {
            method: 'GET',
            headers: API_HEADERS
        })
            .then(result => {return result.json()})
            .then(data => {
                if (data.length > 0) {
                    this.setState({
                        data: data,
                        fileData: data,
                        canExecute: true,
                        canDownload: true,
                        canShowCsvToDownload: false,
                        showAlert: false
                    })
                } else {
                    this.setState({
                        data: [],
                        fileData: [],
                        canExecute: false,
                        canDownload: false,
                        canShowCsvToDownload: false,
                        showAlert: true,
                        alertMessage: 'Il database è vuoto'
                    })
                }
            })
            .catch(reason => console.log(reason));

        let headerPromise = fetch(globalConfig.host + globalConfig.apiName + 'get/data/headers', {
            method: 'GET',
            headers: API_HEADERS
        })
            .then(result => {return result.json()})
            .then(headers => {
                this.setState({
                    header: headers.header
                })
            })
            .catch(reason => console.log(reason));


        Promise.all([dataPromise, headerPromise])
            .then(() => {
                this.setState({
                    execution: false,
                });
                this.setMarkers();
                this.updateCompanyProcessed();
            })
    };

    handlePlacesButton = () => {

        this.setState({
            execution: true,
        });

        let apiPath = globalConfig.host + globalConfig.apiName + 'google/place/data';
        let placeDataPromise = fetch(apiPath, {
            method: 'GET',
            headers: API_HEADERS
        })
            .then(result => {return result.json()})
            .then(response => {

                this.setState({
                    data: response.client,
                    fileData: response.client,
                    canExecute: true,
                    canDownload: true,
                    canShowCsvToDownload: false,
                    showAlert: false
                });

            })
            .catch(reason => console.log(reason));

        Promise.all([placeDataPromise]).then(resultArr => {
            this.setState({
                execution: false,
            });
            this.setMarkers();
            this.updateCompanyProcessed();
        })

    };

    handleDownload = () => {

        let headerObj = this.state.header;
        let dataObj = this.state.fileData;

        let header = [];
        let data = [];
        for (let i = 0; i < headerObj.length; i++) {
            header.push(headerObj[i].label);
        }

        for (let j = 0; j < dataObj.length; j++) {
            let item = dataObj[j];
            delete item._id;
            delete item.__v;
            delete item.google_elaboration;
            let itemArray = Object.values(item);

            let temp = itemArray[1];
            itemArray[1] = itemArray[0];
            itemArray[0] = temp;

            data.push(itemArray);
        }

        console.log(data);

        let csvString = Papa.unparse({
            fields: header,
            data: data
        });

        this.setState({
            csvString: csvString,
            canShowCsvToDownload: true
        });

    };

    updateCompanyProcessed = () => {
        let apiPath = globalConfig.host + globalConfig.apiName + 'get/data/status';
        let placeDataPromise = fetch(apiPath, {
            method: 'GET',
            headers: API_HEADERS
        })
            .then(result => {return result.json()})
            .then(response => {

                this.setState({
                    companyProcessed: {
                        total: response.total,
                        founded: response.founded,
                        notFounded: response.notFounded,
                        notExecuted: response.notExecuted,
                    }
                });

            })
            .catch(reason => console.log(reason));
    };

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                {this.state.execution ? (
                    <Progress/>
                ) : '' }
                <SimpleAppBar title={'Client Manager'} theme={theme}/>
                <Alert
                    vertical={this.state.alertVertical}
                    horizontal={this.state.alertHorizontal}
                    open={this.state.showAlert}
                    handleClose={this.handleCloseAlerts}
                    message={this.state.alertMessage}
                />
                <div className="App">
                    <CsvInput
                        theme={theme}
                        handleData={this.handleData}
                        handleFileInput={this.handleFileInput}
                        file={this.state.file}
                        handleInputChange={this.handleInputChange}
                        csvConfig={this.state.csvConfig}
                        canExecute={this.state.canExecute}
                        execution={this.state.execution}
                        handlePlacesButton={this.handlePlacesButton}
                        canDownload={this.state.canDownload}
                        handleDownload={this.handleDownload}
                        handleCloudLoad={this.handleCloudLoad}
                        companyProcessed={this.state.companyProcessed}
                    />
                    {this.state.canShowCsvToDownload ? (
                        <CsvString ref={'downloadArea'} csvString={this.state.csvString}/>
                    ) : '' }
                    <ClientGrid
                        header={this.state.header}
                        data={this.state.data.sort((a, b) => (b.company > a.company ? -1 : 1))}
                        theme={theme}
                        selected={this.state.selected}
                        search={this.state.search}
                        handleSearchChange={this.handleSearchChange}
                    />
                    <div style={{width: '100%', display: 'block', position: 'relative', height: '100vh', marginTop: '32px'}}>
                        <Typography variant="display1" gutterBottom>
                            Mapppa Clienti
                        </Typography>
                        <Map
                            centerAroundCurrentLocation={true}
                            className="map"
                            google={this.props.google}
                            style={{ height: '100%', position: 'relative', width: '100%' }}
                        >
                            {this.state.dataMarkers.map(marker => <Marker key={marker.id} title={marker.title} position={marker.position}/>)}
                        </Map>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default GoogleApiComponent({
    apiKey: config.apiKey,
    libraries: config.libraries,
})(App)
