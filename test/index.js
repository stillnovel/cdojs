'use strict'

import 'babel-register'
import test from 'ava'
import _ from 'lodash'
import CDO from '..'

import config from './config'

const client = new CDO(config.token, config.config)

function testUnpaginated (t, ress) {
  let items = ress.reduce((items, {results}) => [...items, ...results], [])
  ress.forEach(res => {
    t.is(items.length, res.metadata.resultset.count)
  })
  return items
}

test("CDO#datasets", t => (
  client.unpaginate('datasets')
    .then(ress => testUnpaginated(t, ress))
    .then(datasets => {
      console.log('datasets', datasets)
      return Promise.all(datasets.map(dataset => (
        client.dataset(dataset.id).then(d => {
          t.same(d, _.omit(dataset, 'uid'))
        })
      )))
    })
))

test("CDO#datacategories", t => (
  client.unpaginate('datacategories')
    .then(ress => testUnpaginated(t, ress))
    .then(datacategories => {
      console.log('datacategories', datacategories)
      return Promise.all(datacategories.map(datacategory => (
        client.datacategory(datacategory.id).then(d => {
          t.same(d, datacategory)
        })
      )))
    })
))
