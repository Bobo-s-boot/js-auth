// Підключаємо роутер до бек-енду
const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('index', {
    name: 'index',

    component: [],

    title: 'Home page',

    data: {},
  })
})

const auth = require('./auth')

router.use('/', auth)

module.exports = router
