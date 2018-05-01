
const Client = require('../model/client');
const config = require('../config/config');
const utility = require('../utility');
const googleMapsClient = require('@google/maps').createClient({
    key: config.googleApiKey,
    Promise: Promise
});


exports.index = (req, res, next) => {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({ title: 'Hello World' }));
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

exports.data_post = (req, res, next) => {
    let csvData = req.body.data;
    if (csvData !== undefined && csvData.length > 0) {
        csvData.forEach(item => {

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

            client.save()
                .then((success) => {
                    Client.find()
                        .then(result => {
                            res.header('Content-Type', 'application/json');
                            res.json({
                                data: result,
                                header: utility.data_headers()
                            });
                        })
                        .catch(err => next(err));
                })
                .catch((err) => next(err));

        });
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

                    let result = response.json.results[0];

                    if (result.types.includes('establishment')) {

                        clients[index].place_id = result.place_id;
                        clients[index].latitude = result.geometry.location.lat;
                        clients[index].longitude = result.geometry.location.lng;
                        clients[index].google_elaboration = 1;
                    } else {
                        clients[index].google_elaboration = -1;
                    }

                    return result;
                })
                .catch((err) => {
                    console.log(err);
                });
        });

        let googleGeocodeAllPromise = Promise.all(googlePromiseArr)
            .then(clientGeocodeResult => {

            clientGeocode = clientGeocodeResult;

            return clientGeocode;
        });

        googleGeocodeAllPromise.then(clientGeocode => {

            let googlePlacesArr = clientGeocode.map(geocode => {
                return googleMapsClient.place({ placeid: geocode.place_id})
                    .asPromise()
                    .then((response) => {

                        let result = response.json.result;
                        let address_components = result.address_components;

                        let clientIndex = utility.find_index_of_place_id(clients, geocode.place_id);
                        if (clientIndex !== -1) {
                            clients[clientIndex].company = result.name;
                            clients[clientIndex].telephone = result.formatted_phone_number;
                            clients[clientIndex].country = utility.find_address_component(address_components, 'country');
                            clients[clientIndex].city = utility.find_address_component(address_components, 'administrative_area_level_3');
                            clients[clientIndex].district = utility.find_address_component(address_components, 'administrative_area_level_2', 'short_name');
                            clients[clientIndex].postal_code = utility.find_address_component(address_components, 'postal_code');
                            clients[clientIndex].address = utility.find_address_component(address_components, 'route');
                            clients[clientIndex].civic_number = utility.find_address_component(address_components, 'street_number', 'long_name');
                            clients[clientIndex].google_elaboration = 1;
                        }

                        return result;
                    })
                    .catch((err) => {
                        console.log(err);
                    });
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