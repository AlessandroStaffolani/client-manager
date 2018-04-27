

export function composeAddress(addressComponents, types) {

    let address = '';

    addressComponents.reverse().forEach(component => {
        component.types.forEach(type => {
            if (types.includes(type)) {
                address += component.long_name + ', ';
            }
        })
    });

    return address;
}