
const fs = require('fs');

export function readInputFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.readAsText(file);

        reader.onload = (event) => {
            let csv = event.target.result;
            resolve(csv);
        };
        reader.onerror = (event) => {
            if(event.target.error.name === "NotReadableError") {
                reject(event.target.error);
            }
        };
    });
}

export function reformatCsvData(data) {
    let idCounter = 1;
    let newData = [];
    let header = data[0];
    for (let i = 1; i < data.length; i++) {
        let temp = {};
        temp.id = idCounter++;
        for (let j = 0; j < data[i].length; j++) {
            temp[header[j].toLowerCase().replace('à', 'a')] = data[i][j]
        }
        newData.push(temp);
    }

    let newHeader = [];
    for (let i = 0; i < header.length; i++) {
        newHeader.push({
            id: i + 1,
            code: header[i].toLowerCase().replace('à', 'a'),
            label: header[i]
        })
    }

    return {
        header: newHeader,
        data: newData
    };
}

export function createCsvFile(destination, csvString) {

    console.log(destination, csvString);
    return new Promise((resolve, reject) => {
        fs.writeFile(destination, csvString, function(err) {
            if(err) {
                reject(err);
            }

            resolve(200);
        });
    });
}