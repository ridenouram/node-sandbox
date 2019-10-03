const router = require('express').Router();
const User = require('../models/user');
const tokenService = require('../token-service');

const sendUser = (res, user) => {
  return tokenService.sign(user)
    .then(token => {

    })
}

const checkCredentialsExist = (email, password) => {
  if(!email || !password) {
    return Promise.reject({
      statusCode: 400,
      error: 'Email and password are required'
    });
  }
  return Promise.resolve();
}


router
  .post('/signup', (req, res, next) => {
    //save user to db
    const { email, password } = req.body;
    let globalUser = null;   //one way to pass user through the .then chain (instead of nesting thens)

    checkCredentialsExist(email, password)
      .then((() => {
        return User.exists({ email });
      })
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
  })

  .post('/signin', (req, res, next) => {
    const { body } = req;
    const { email, password } = body;

    checkCredentialsExist(email, password)
      .then(() => {
        return User.findOne({ email });
      })
      .then(user => {
        if(!user || !user.comparePassword(password)) {
          throw {
            statusCode: 401,
            error: 'Invalid password or username'
          };
        }
        return sendUser(res, user);
      })
      .catch(next);
  });

module.exports = router;