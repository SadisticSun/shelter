'use strict'

var express = require('express')
var db = require('../db')
var helpers = require('./helpers')
var path = require('path')

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'view')
  .use(express.static('static'))
  .use('/image', express.static('db/image'))
  .get('/', all)
  .get('/:id', detail)
  /* TODO: Other HTTP methods. */
  // .post('/', add)
  // .put('/:id', set)
  // .patch('/:id', change)
  // .delete('/:id', remove)
  .listen(1902)

function all(req, res) {
  var result = {
    errors: [],
    data: db.all()
  }

  /* Use the following to support just HTML:  */
  res.render('list.ejs', Object.assign({}, result, helpers))

  /* Support both a request for JSON and a request for HTML  */
  // res.format({
  //   json: () => res.json(result),
  //   html: () => res.render('list.ejs', Object.assign({}, result, helpers))
  // })
}

function detail(req, res) {
  var id = req.params.id

  if (!id) {
    return
  }

  if (db.has(id)) {
    var result = {
      data: db.get(id)
    }
    res.render('detail.ejs', Object.assign({}, result, helpers))
  } else {
    var errors = [{
      title: 'Not Found',
      id: 404,
      detail: 'Whoops! We could not find this animal :('
    }]
    res.render('error.ejs', { errors: errors })
  }

}
