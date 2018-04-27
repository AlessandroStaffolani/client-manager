import React from 'react';
import { config } from './config';
import { Map } from './Map';
import GoogleApiComponent from './GoogleApiComponent';

export class Container extends React.Component {
    render() {
        const style = {
            width: '80vw',
            height: '80vh'
        };
        return (
            <div style={style}>
                <Map
                    centerAroundCurrentLocation={true}
                    className="map"
                    google={this.props.google}
                    style={{ height: '100%', position: 'relative', width: '100%' }}
                />
            </div>
        )
    }
}

export default GoogleApiComponent({
    apiKey: config.apiKey,
    libraries: config.libraries,
})(Container)