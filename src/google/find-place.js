
export function findPlace(google, address) {

    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status === 'OK') {
                if (results.length > 0 ) {
                    resolve(results[0]);
                }
            } else {
                reject('Geocode was not successful for the following reason: ' + status);
            }
        });
    });
}

export function findPlaceById(google, map, place_id) {

    const service = new google.maps.places.PlacesService(map);

    return new Promise((resolve, reject) => {

        service.getDetails({
            placeId: place_id
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {

                resolve(place);
            } else {
                reject(status);
            }
        });

    });
}