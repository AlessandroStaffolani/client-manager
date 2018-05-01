const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let ClientSchema = new Schema(
    {
        company: {type: String, required: true},
        country: {type: String, required: true, default: 'Italia'},
        city: {type: String, required: true},
        district: {type: String},
        postal_code: {type: String},
        address: {type: String},
        civic_number: {type: String},
        telephone: {type: String},
        email: {type: String},
        latitude: {type: Number},
        longitude: {type: Number},
        place_id: {type: String},
        google_elaboration: {type: Number} // -1 = No Result | 0 = Query Limit (try again) | 1 = Information founded
    }
);

ClientSchema
    .virtual('formatted_address')
    .get(function () {
        return this.address + ', ' + this.civic_number
    });

ClientSchema
    .virtual('full_address')
    .get(function () {
        return this.address + ', ' + this.civic_number + ', ' + this.city + ', ' + this.district + ', ' + this.country
    });

//Export model
module.exports = mongoose.model('Client', ClientSchema);