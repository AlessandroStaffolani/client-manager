
const Client = require('../model/client');


exports.index = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ title: 'Hello World' }));
};

exports.data_get = function (req, res, next) {

    Client.find()
        .then(result => {
            console.log(result);
            res.header('Content-Type', 'application/json');
            res.json(result);
        })
        .catch(err => next(err));

};

exports.data_post = function (req, res, next) {
    let csvData = req.body.data;
    console.log(csvData);
    if (csvData !== undefined && csvData.length > 0) {
        csvData.forEach(item => {

            let client = new Client({
                company: item.azienda,
                country: (item.stato !== undefined) ? item.stato : 'Italia',
                city: item.citta,
                district: (item.provincia !== undefined) ? item.provincia : '',
                postal_code: (item.cap !== undefined) ? item.cap : '',
                address: (item.indirizzo !== undefined) ? item.indirizzo : '',
                civic_number: (item.civico !== undefined) ? item.civico : '',
                telephone: (item.telefono !== undefined) ? item.telefono : '',
                email: (item.email !== undefined) ? item.email : '',
                latitude: (item.latitudine !== undefined) ? item.latitudine : '',
                longitude: (item.longitudine !== undefined) ? item.longitudine : ''
            });

            client.save()
                .then((success) => console.log(success))
                .catch((err) => next(err));

        });
    }
    console.log('chissà');
    res.json(csvData);
};