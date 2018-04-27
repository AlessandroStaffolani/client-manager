
# Client Manager

Simple web application made with: 

- React
- Material UI
- Google Maps Api

This application allows to:
- Import a CSV file from local
- Find the address and the location (latitude and longitude) of the clients
- Shows the clients on the map
- Export a new CSV with the updated data (In this version it prints a string on a textarea with the new CSV)

The CSV should contains at least these fields:
```
company,city,address,latitude,longitude
```

This application is able to find `address,latitude,longitude` it needs only company and city.

## Installation

```
git clone [this-repo]
cd client-manager
yarn install 
```

## Usage

```
yarn start
```