
const Client = require('./model/client');

exports.data_headers = () => {
    return [
        {id: 0, label: 'Azienda', code: 'company'},
        {id: 1, label: 'Stato', code: 'country'},
        {id: 2, label: 'Città', code: 'city'},
        {id: 3, label: 'Provincia', code: 'district'},
        {id: 4, label: 'CAP', code: 'postal_code'},
        {id: 5, label: 'Indirizzo', code: 'address'},
        {id: 6, label: 'Civico', code: 'civic_number'},
        {id: 7, label: 'Telefono', code: 'telephone'},
        {id: 8, label: 'Email', code: 'email'},
        {id: 9, label: 'Latitudine', code: 'latitude'},
        {id: 10, label: 'Longitudine', code: 'longitude'},
    ]
};

exports.value_is_empty = (value) => {
    if (value === undefined || value === null || value === '') {
        return true;
    }
};

exports.compose_address_to_search = (client) => {
    let address = '';

    address += client.company + ', ' + client.city + ', ';
    if (!this.value_is_empty(client.postal_code)) {
        address += client.postal_code + ', ';
    }

    if (!this.value_is_empty(client.country)) {
        address += client.country;
    }

    return address;
};

exports.find_index_of_place_id = (clientsArray, placeId) => {

    let id = -1;

    clientsArray.forEach((client, index) => {
        if (client.place_id === placeId) {
            id = index;
        }
    });

    return id;
};

exports.find_address_component = (address_components, component, type = 'long_name') => {
    let value = null;
    address_components.map(comp => {
        if (comp.types.includes(component)) {
            value = comp[type];
        }
    });
    return value;
};