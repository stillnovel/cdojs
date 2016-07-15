'use strict'

import test from 'ava'
import _ from 'lodash'
import CDO from '..'

import config from './config'

const client = new CDO(config.token, config.opts)

test("CDO#all", t => {
  let ress = []
  return client
    .all('datacategories', res => {
      ress.push(res)
      return false // keep paging
    })
    .then(retval => {
      t.same(retval, null) // if a truthy value is returned above, retval will be res from that iteration
      let items = ress.reduce((items, {results}) => [...items, ...results], [])
      ress.forEach(res => {
        t.is(items.length, res.metadata.resultset.count)
      })
    })
})

test("CDO.paramsForNextPage, CDO.paramsForPrevPage", t => {
  t.same({offset: 36, limit: 25}, CDO.paramsForNextPage({offset: 11}))
  t.same({offset: 11, limit: 25}, CDO.paramsForPrevPage({offset: 36}))

  ;[CDO.paramsForNextPage, CDO.paramsForPrevPage].forEach(fn => {
    t.same({offset: 0, limit: 25}, fn())
    t.same({offset: 0, limit: 24}, fn({limit: 24}))
    t.same({offset: 0, limit: 25}, fn({offset: -1}))
    t.same({offset: 0, limit: 25, count: 1000}, fn({count: 1000}))
  })
})

test("/datasets", t => (
  client.datasets().then(({results}) => (
    client.dataset(results[0].id).then(d => {
      t.same(d, _.omit(results[0], 'uid'))
    })
  ))
))

test("/datacategories", t => (
  client.datacategories().then(({results}) => (
    client.datacategory(results[0].id).then(d => {
      t.same(d, results[0])
    })
  ))
))

test("/datatypes", t => (
  client.datatypes().then(({results}) => (
    client.datatype(results[0].id).then(d => {
      t.same(d, _.omit(results[0], 'name'))
    })
  ))
))

test("/locationcategories", t => (
  client.locationcategories().then(({results}) => (
    client.locationcategory(results[0].id).then(d => {
      t.same(d, results[0])
    })
  ))
))

test("/locations", t => (
  client.locations().then(({results}) => (
    client.location(results[0].id).then(d => {
      t.same(d, results[0])
    })
  ))
))

test("/stations", t => (
  client.stations().then(({results}) => (
    client.station(results[0].id).then(d => {
      t.same(d, results[0])
    })
  ))
))
