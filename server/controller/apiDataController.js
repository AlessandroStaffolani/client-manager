const Client = require('../model/client');
const config = require('../config/config');
const utility = require('../utility');
const googleMapsClient = require('@google/maps').createClient({
    key: config.googleApiKey,
    Promise: Promise
});


const GOOGLE_OK_STATUS = 'OK';
const GOOGLE_ZERO_RESULTS = 'ZERO_RESULTS';
const GOOGLE_QUERY_LIMIT = 'OVER_QUERY_LIMIT';


exports.index = (req, res, next) => {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({title: 'Hello World'}));
};

exports.get_data_headers = (req, res, next) => {
    res.header('Content-Type', 'application/json');
    res.json({header: utility.data_headers()});
};

exports.data_get = (req, res, next) => {

    Client.find()
        .then(result => {
            res.header('Content-Type', 'application/json');
            res.json(result);
        })
        .catch(err => next(err));

};

exports.data_status_get = (req, res, next) => {

    let allPromise = Client.find()
        .then(result => { return result.length; })
        .catch(err => next(err));

    let foundedPromise = Client.find({google_elaboration: 1})
        .then(result => { return result.length; })
        .catch(err => next(err));

    let notFoundedPromise = Client.find({google_elaboration: -1})
        .then(result => { return result.length; })
        .catch(err => next(err));

    let notExecutedPromise = Client.find({google_elaboration: 0})
        .then(result => { return result.length; })
        .catch(err => next(err));

    Promise.all([allPromise, foundedPromise, notFoundedPromise, notExecutedPromise])
        .then(results => {
            res.header('Content-Type', 'application/json');
            res.json({
                total: results[0],
                founded: results[1],
                notFounded: results[2],
                notExecuted: results[3]
            });
        })
};

exports.data_post = (req, res, next) => {
    let csvData = req.body.data;
    if (csvData !== undefined && csvData.length > 0) {

        let clientsData = [];
        csvData.map(item => {

            let google_elaboration = 1;
            if (utility.value_is_empty(item.telefono) && utility.value_is_empty(item.latitudine) && utility.value_is_empty(item.longitudine)) {
                google_elaboration = 0;
            }

            let client = new Client({
                company: item.azienda,
                country: (!utility.value_is_empty(item.stato)) ? item.stato : 'Italia',
                city: item.citta,
                district: (!utility.value_is_empty(item.provincia)) ? item.provincia : '',
                postal_code: (!utility.value_is_empty(item.cap)) ? item.cap : '',
                address: (!utility.value_is_empty(item.indirizzo)) ? item.indirizzo : '',
                civic_number: (!utility.value_is_empty(item.civico)) ? item.civico : '',
                telephone: (!utility.value_is_empty(item.telefono)) ? item.telefono : '',
                email: (!utility.value_is_empty(item.email)) ? item.email : '',
                latitude: (!utility.value_is_empty(item.latitudine)) ? item.latitudine : '',
                longitude: (!utility.value_is_empty(item.longitudine)) ? item.longitudine : '',
                place_id: null,
                google_elaboration: google_elaboration
            });

            clientsData.push(client);

        });

        Client.collection.insertMany(clientsData)
            .then(result => {
                res.header('Content-Type', 'application/json');
                res.json({
                    data: result.ops,
                    header: utility.data_headers()
                });
            })
            .catch(err => next(err));
    }
};

exports.place_data_put = (req, res, next) => {

    let clients = undefined;
    let clientGeocode = [];
    let clientPlaces = [];

    let findClientToProcessPromise = Client.find({google_elaboration: 0})
        .then(result => {

            clients = result;

            return result;
        })
        .catch(err => next(err));

    findClientToProcessPromise.then(result => {
        let googlePromiseArr = clients.map((client, index) => {
            let address = utility.compose_address_to_search(client);

            return googleMapsClient.geocode({address: address})
                .asPromise()
                .then((response) => {

                    let status = response.json.status;
                    console.log(response.json);

                    if (status === GOOGLE_OK_STATUS) {

                        let result = response.json.results[0];
                        let address_components = result.address_components;

                        if (utility.find_address_component(address_components, 'country') === 'Italy') {

                            if (result.types.includes('establishment')) {

                                clients[index].place_id = result.place_id;
                                clients[index].latitude = result.geometry.location.lat;
                                clients[index].longitude = result.geometry.location.lng;
                                clients[index].country = 'Italia';
                                clients[index].city = utility.find_address_component(address_components, 'administrative_area_level_3');
                                clients[index].district = utility.find_address_component(address_components, 'administrative_area_level_2', 'short_name');
                                clients[index].postal_code = utility.find_address_component(address_components, 'postal_code');
                                clients[index].address = utility.find_address_component(address_components, 'route');
                                clients[index].civic_number = utility.find_address_component(address_components, 'street_number', 'long_name');
                            } else {
                                clients[index].google_elaboration = -1;
                            }
                        }

                        return result;
                    } else if (status === GOOGLE_QUERY_LIMIT) {
                        clients[index].google_elaboration = 0;
                    }
                })
                .catch((err) => {
                    console.log(err);
                    next(err);
                });
        });

        let googleGeocodeAllPromise = Promise.all(googlePromiseArr)
            .then(clientGeocodeResult => {

                clientGeocode = clientGeocodeResult;

                return clientGeocode;
            });

        googleGeocodeAllPromise.then(clientGeocode => {

            let googlePlacesArr = clientGeocode.map(geocode => {
                if (geocode !== undefined) {
                    return googleMapsClient.place({placeid: geocode.place_id})
                        .asPromise()
                        .then((response) => {

                            let status = response.json.status;

                            if (status === GOOGLE_OK_STATUS) {

                                let result = response.json.result;
                                let address_components = result.address_components;

                                let clientIndex = utility.find_index_of_place_id(clients, geocode.place_id);
                                if (utility.find_address_component(address_components, 'country') === 'Italy') {
                                    if (clientIndex !== -1) {
                                        clients[clientIndex].company = result.name;
                                        clients[clientIndex].telephone = result.formatted_phone_number;
                                        clients[clientIndex].google_elaboration = 1;
                                    }
                                }

                                return result;
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            next(err);
                        });
                }
            });

            let googlePlacesAllPromise = Promise.all(googlePlacesArr)
                .then(clientPlacesResult => {

                   let updatePromiseArr = clients.map(client => {
                        return Client.findByIdAndUpdate(client.id, client, {})
                            .catch(err => next(err))
                            .then(updatedClient => {
                                return updatedClient
                            });
                    });

                    Promise.all(updatePromiseArr)
                        .then(updatedClients => {
                            Client.find()
                                .then(result => {
                                    res.header('Content-Type', 'application/json');
                                    res.json({client: result});
                                })
                                .catch(err => next(err));
                        });

                });

        })
    });


};