const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Entry } = require('./models');
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });

//GET request to /blog-posts, return all////////////////////////////////////////////
router.get('/', jwtAuth, (req, res) => {
  Entry.find()
    .then(entry => {

      res.json({
        entries: entry.map(entry => entry.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
})

//GET request to /blog-posts, find by id
router.get('/:id', (req, res) => {
  Entry.findById(req.params.id)
    .then(entry => {
      res.json(entry.serialize())
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
})

//POST request
router.post("/", jsonParser, (req, res) => {
  console.log("POST request received")
  const requiredFields = ["activity", "location"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }


  Entry.create({
    // user: req.body.user,
    activity: req.body.activity,
    location: req.body.location,
    notes: req.body.notes
  })
    .then(entry => res.status(201).json(entry))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

//PUT request
router.put("/:id", jsonParser, (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ["activity", "location", "notes"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Entry
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id", (req, res) => {
  Entry.findByIdAndRemove(req.params.id)
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});


//hard code entries here

module.exports = router;

