# cdojs
JS wrapper for NCEI's Climate Data Online API

## Installation
```sh
$ npm install cdojs
```

## Usage
See the [CDO API documentation](http://www.ncdc.noaa.gov/cdo-web/webservices/v2)
for a list of all endpoints and params supported.

Init client:
```js
var CDO = require('cdojs')
var client = new CDO('mytoken')
```

Retrieve first page of queryable datasets:
```js
client
  .datasets()
  .then(console.log)
```

Retrieve every type of queryable temperature measurement: (56 at the time of writing)
```js
client.page('datatypes', {datacategoryid: 'TEMP'}, console.log)
```

Typical usage: fetch all stations for ZIP code, then fetch all temperatures
between 2000 and 2001 for the first returned station
```js
// init client with some default query params
var client = new CDO('mytoken', {params: {
  datasetid: 'GHCND', // "Daily Summaries"
  datatypeid: 'TOBS', // "Temperature at the time of observation", one of the TEMP datatypes returned by the above query
  startdate: '2000-01-01',
  enddate: '2001-01-01'
}})

// fetch all stations for ZIP code
var results = []
client
  .stations({locationid: 'ZIP:00002'}) // "Yukon Flats Nat Wildlife, AK 00002". Not all ZIPs have a station
  .then(stations => (
    client.page('data', {stationid: stations.results[0].id}, page => {
      results = results.concat(page.results)
      return false // return true to stop paging
    })
  ))
  .then(() => { console.log(results) })
```
