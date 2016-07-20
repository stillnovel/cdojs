# cdojs
Node+browser package for Climate Data Online (CDO) API

## Installation
```sh
$ npm install --save cdojs
```

## Usage+examples
cdojs should support all params and endpoints found on NCEI/NCDC's
[documentation](http://www.ncdc.noaa.gov/cdo-web/webservices/v2)
for the CDO API.

Init the client:
```js
var CDO = require('cdojs')
var client = new CDO('mytoken')
```

To retrieve the first page of
[queryable datasets](http://www.ncdc.noaa.gov/cdo-web/webservices/v2#datasets),
your code might look something like this:
```js
client
  .datasets()
  .then(console.log)
```

Retrieve all 56 kinds of queryable temperature measurements, 25 per page
(montly mean, daily minimum/maximum, etc):
```js
client.all('datatypes', {datacategoryid: 'TEMP'}, console.log) // calls console.log once per page
```

Alternatively, to page manually:
```js
getDatatypes({datacategoryid: 'TEMP'}).then(console.log)
function getDatatypes (params) {
  return client
    .datatypes(params)
    .then(page => (
      (page.results || []).length
        ? getDatatypes(CDO.paramsForNextPage(params)).then(pages => [page, ...pages])
        : [page]
    ))
}
```

Typical usage: fetch all stations for ZIP code, then fetch daily temperatures
between 2000 and 2001 for the first returned station
```js
// init client with some default query params
var client = new CDO('mytoken', {params: { // set some default params
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
    client.all('data', {stationid: stations.results[0].id}, page => {
      results = results.concat(page.results)
      return false // return true to stop paging
    })
  ))
  .then(() => { console.log(results) })
```
