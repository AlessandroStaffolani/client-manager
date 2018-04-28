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
            completed: 0,
            csvString: '',
            csvConfig: {
                delimiter: DEFAULT_DELIMITER,
                newline: DEFAULT_NEWLINE,
                quoteChar: DEFAULT_ESCAPECHAR,
                escapeChar: DEFAULT_ESCAPECHAR,
            }
        };
        this.handleData = this.handleData.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handlePlacesButton = this.handlePlacesButton.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
    }

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
                if (row[k].toString().toLowerCase().includes(searchValue.toLowerCase())) {
                    mantain = true;
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

        let file = event.target.files[0];
        let csvData = undefined;

        let fileReaderPromise = readInputFile(file);
        fileReaderPromise
            .then((csv) => {
                csvData = Papa.parse(csv, this.csvConfig);
                csvData = reformatCsvData(csvData.data);
                this.setState({
                    file: file,
                    header: csvData.header,
                    data: csvData.data,
                    fileData: csvData.data,
                    canExecute: true,
                    canDownload: false
                });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    handlePlacesButton = () => {

        const data = this.state.fileData;
        let apiPath = globalConfig.host + globalConfig.apiName + 'post/data';

        fetch(apiPath, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: data,
            })
        })
            .then(result => console.log(result.json()))
            .catch(reason => console.log(reason));

        fetch(apiPath, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
            .then(result => console.log(result.json()))
            .catch(reason => console.log(reason));


        /*this.setState({
            execution: true,
            completed: 0,
            canDownload: false
        });

        let newData = [];
        let markers = [];

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let completed = (100 * (i+1)) / data.length;

            this.setState({completed: completed});

            let address = item.azienda + ', ' + item.citta;
            if (item.cap !== undefined) {
                address += ', ' + item.cap;
            }
            if (item.stato !== undefined) {
                address += ', ' + item.stato;
            }
            let placePromise = findPlace(this.props.google, address);
            placePromise.then(result => {

                let placeIdPromise = findPlaceById(this.props.google, this.props.map, result.place_id);
                placeIdPromise.then(place => {
                    newData[i] = item;
                    newData[i].indirizzo = composeAddress(place.address_components, ADDRESS_TYPES);
                    newData[i].telefono = place.formatted_phone_number;
                    newData[i].latitudine = place.geometry.location.lat();
                    newData[i].longitudine = place.geometry.location.lng();

                    markers.push({
                        id: i,
                        title: item.azienda,
                        position: place.geometry.location
                    });

                    this.setState({
                        data: newData,
                        fileData: newData,
                        dataMarkers: markers
                    });

                    if (i === data.length - 1) {
                        this.setState({
                            execution: false
                        })
                    }
                });
                placeIdPromise.catch(reason => console.log(reason));

            });
            placePromise.catch(reason => {
                newData[i] = item;

                this.setState({
                    data: newData,
                    fileData: newData
                });

                if (i === data.length - 1) {
                    this.setState({
                        execution: false
                    })
                }
            });
        }*/

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
            let itemArray = Object.values(item);
            itemArray.splice(0, 1);
            data.push(itemArray);
            /*if (item.stato !== undefined) {
                data.push([
                    item.azienda,
                    item.stato,
                    item.citta,
                    item.address,
                    item.latitudine,
                    item.longitudine
                ]);
            } else {
                data.push([
                    item.azienda,
                    item.citta,
                    item.address,
                    item.latitudine,
                    item.longitudine
                ]);
            }*/
        }

        let csvString = Papa.unparse({
            fields: header,
            data: data
        });

        this.setState({
            csvString: csvString,
            canDownload: true
        });

        /*let writePromise = createCsvFile(DEFAULT_DOWNLOAD_LOCATION, csvString)
            .then(() => {
                console.log('File creato');
            })
            .catch(err => console.log(err));*/

    };

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                {this.state.execution ? (
                    <Progress completed={this.state.completed}/>
                ) : '' }
                <SimpleAppBar title={'Client Manager'} theme={theme}/>
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
                        completed={this.state.completed}
                        handleDownload={this.handleDownload}
                    />
                    {this.state.canDownload ? (
                        <CsvString ref={'downloadArea'} csvString={this.state.csvString}/>
                    ) : '' }
                    <ClientGrid
                        header={this.state.header}
                        data={this.state.data}
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
