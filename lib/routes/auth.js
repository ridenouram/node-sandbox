const router = require('express').Router();
const User = require('../models/user');
const tokenService = require('../token-service');

router
  .post('/signup', (req, res, next) => {
    //save user to db
    const { email, password } = req.body;

    if(!email || !password) {
      next({
        statusCode: 400,
        error: 'Email and password are required'
      });
    }

    let globalUser = null;   //one way to pass user through the .then chain (instead of nesting thens)
    User.exists({ email: req.body.email })
      .then(exists => {
        if(exists) {
          throw {
            statusCode: 400,
            error: `Email ${req.body.email} already in use`
          };
        }

        return User.create(req.body);

      })
      .then(user => {
        //make a token
        globalUser = user;
        return tokenService.sign(user);
      })
      .then(token => {
        res.json({
          _id: globalUser._id,
          email: globalUser.email,
          token: token
        });
      })
      .catch(next);
  });

module.exports = router;