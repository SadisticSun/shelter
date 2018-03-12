
// Had some help from Jonah <3 Thanks bro!

const fs            = require('fs')
const express       = require('express')
const compression   = require('compression')
const helmet        = require('helmet')
const multer        = require('multer')
const contentType   = require('content-type')
const HTTPStatus    = require('http-status')
const bodyParser    = require('body-parser')
const db            = require('../db')
const helpers       = require('./helpers')
const httpCodes     = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  notFound: 404,
  gone: 410,
  unprocessable: 422,
  serverError: 500
}

// Error handler, inspired by Jonah
const handleError = (statusCodes, res) => {
  const error = {
    errors: statusCodes.map(err => {
      return {
        id: err,
        title: HTTPStatus[err],
        detail: 'No errors'
      }
    })
  }
  res.format({
    json: () => res.json(error),
    html: () => res.render('error.ejs', Object.assign({}, error, helpers))
  })
}

// Handles the main overview page
const getAll = (req, res) => {
  const result = {
    errors: [],
    data: db.all()
  }
  res.format({
    json: () => res.json(result),
    html: () => res.render('list.ejs', Object.assign({}, result, helpers))
  })
}

// Handles the detail page request
const getDetail = (req, res) => {
  // Animal ID, which is a param
  const id = req.params.id
  let animalExists

  // Try getting checking the database for the animal ID
  try {
    animalExists = db.has(id)
  } catch (err) {
    handleError([httpCodes.notFound], res)
    return
  }

  // If the animal is already in the database, render the detail page
  if (animalExists) {
    const result = {
      data: db.get(id)
    }
    res.format({
      json: () => res.json(result),
      html: () => res.render('detail.ejs', Object.assign({}, result, helpers))
    })

    // If the animal once existed but has been removed, render a 410 error page
  } else if (db.removed(id)) {
    handleError([httpCodes.gone], res)

    // If nothing has been found, render a 404 page
  } else {
    handleError([httpCodes.notFound], res)
  }
}

// Handles the upload form page
const addNew = (req, res) => {
  res.render('add.ejs')
}

// Handles the POST request for adding a new animal
const add = (req, res) => {
  const formBody = req.body
  const file = req.file
  if (contentType.parse(req).type === 'multipart/form-data') {
    formBody.declawed        = formBody.declawed ? formBody.declawed === '1' : undefined
    formBody.secondaryColor  = formBody.secondaryColor === '' ? undefined : formBody.secondaryColor
    formBody.vaccinated      = formBody.vaccinated === '1'
    formBody.weight          = parseInt(formBody.weight || '0', 10)
    formBody.age             = parseInt(formBody.age, 10)
  }

  try {
    // Try adding a new animal to the database
    const newAnimal = db.add(formBody)
    // If the form body has a file attribute, rename the filepath with the animal ID and JPG extension
    if (file) 
      fs.rename(file.path, `db/image/${newAnimal.id}.jpg`)
    
    // Redirect to the detail page
    res.redirect(`/${newAnimal.id}`)
  } catch (err) {
    // If there was an error adding the animal to the db, remove the uploaded image to prevent clutter
    if (file) {
      fs.unlink(file.path, err => {
        // If there was an error unlinking the file, render a 500 error. Else, render a 422 error
        err ? handleError([httpCodes.serverError], res) : handleError([httpCodes.unprocessable], res)
      })
    } else {
      // If no file is attached, render a 422 error
      handleError([httpCodes.unprocessable], res)
    }
  }
}

// Handles PUT requests of an animal
const set = (req, res) => {
  const id = req.params.id
  const animalId = req.body.id

  if (id === animalId) {
    let status
    try {
      status = db.has(bodyId) ? httpCodes.ok : httpCodes.created
      db.set(req.body)
      res.status(status).json({
        errors: [],
        data: db.get(animalId)
      })
    } catch (err) {
      handleError([httpCodes.unprocessable], res)
    }
  } else {
    handleError([httpCodes.badRequest], res)
  }
}

const change = (req, res) => {
  const id = req.params.id
  try {
    const animalExists = db.has(id)
    const animalRemoved = db.removed(id)
    if (animalExists) {
      const animal = db.get(id)
      Object.assign(animal, req.body)
      db.set(animal)
      res.status(httpCodes.ok).json({
        errors: [],
        data: db.get(id)
      })
    } else if (animalRemoved) {
      handleError([httpCodes.gone], res)
    } else {
      handleError([httpCodes.notFound], res)
    }
  } catch (err) {
    handleError([httpCodes.unprocessable], res)
  }
}

// Handles DELETE requests for an animal
const remove = (req, res) => {
  const id = req.params.id
  const isRemoved = db.removed(id)
  // If the animal is already gone, render a 410 error
  if (isRemoved) {
    handleError([httpCodes.gone], res)
  } else {
    // Try to remove the animal and the image attached to it
    try {
      db.remove(id)
      fs.unlink(`db/image/${id}.jpg`, err => {
        err ? handleError([httpCodes.gone], res) : res.status(httpCodes.noContent).end()
      })
    // Render a 404 error if the animal is not found
    } catch (err) {
      handleError([httpCodes.notFound], res)
    }
  }
}

// Handles the file upload with Multer
const upload = multer({
  dest: 'db/image', // File destination
  fileFilter: (req, file, callback) => {
    
    // Filters files to only allow image/jpeg
    callback(null, file.mimetype === 'image/jpeg')
  }
})

// Export the server application
module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'view')
  .use(helmet())
  .use(compression())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static('static'))
  .use('/image', express.static('db/image'))
  .get('/', getAll)
  .post('/', upload.single('image'), add)
  .get('/add', addNew)
  .get('/:id', getDetail)
  .put('/:id', set)
  .patch('/:id', change)
  .delete('/:id', remove)
  .listen(1902)
