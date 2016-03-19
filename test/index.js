'use strict'

import 'babel-register'
import test from 'ava'
import _ from 'lodash'
import CDO from '..'

import config from './config'

const client = new CDO(config.token, config.opts)

function getList (client, method, ...args) {
  return client
    .unpaginate(method, ...args)
    .then(ress => {
      let items = ress.reduce((items, res) => [...items, ..._.get(res, 'results', [])], [])
      ress.forEach(res => {
        if (items.length !== res.metadata.resultset.count) throw new Error(`${items.length} !== ${res.metadata.resultset.count}`)
      })
      return items
    })
}

test("/datasets", t => (
  getList(client, 'datasets').then(datasets => (
    Promise.all(datasets.map(dataset => (
      client.dataset(dataset.id).then(d => {
        t.same(d, _.omit(dataset, 'uid'))
      })
    )))
  ))
))

test("/datacategories", t => (
  getList(client, 'datacategories').then(datacategories => (
    Promise.all(datacategories.map(datacategory => (
      client.datacategory(datacategory.id).then(d => {
        t.same(d, datacategory)
      })
    )))
  ))
))

test("/datatypes", t => (
  getList(client, 'datatypes').then(datatypes => {
    return Promise.all(datatypes.map(datatype => (
      client.datatype(datatype.id).then(d => {
        t.same(d, _.omit(datatype, 'name'))
      })
    )))
  })
))
