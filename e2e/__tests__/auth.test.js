const request = require('../request');
const { dropCollection } = require('../db');
// const { signUpUser } = require('../data-helpers');

describe('Auth API', () => {
  beforeEach(() => dropCollection('users'));

  const testUser = {
    email: 'me@me.com',
    password: 'abc'
  };

  let user = null;
  beforeEach(() => {
    return request
      .post('/api/auth/signup')
      .send(testUser)
      .expect(200)
      .then(({ body }) => user = body);
  });

  it('signs up a user', () => {
    expect(user.token).toBeDefined();
  });

  it('cannot sign up with same email', () => {
    return request
      .post('/api/auth/signup')
      .send(testUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe('Email me@me.com already in use');
      });
  });

  function testEmailAndPasswordRequired(testName, user) {
    it(`sign up requires ${testName}`, () => {
      return request
      .post('/api/auth/signup')
      .send(user)
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe('Email and password are required');
      });
    })
  }

  testEmailAndPasswordRequired('email', { password: 'no email given' });
  testEmailAndPasswordRequired('password', { email: 'no@password.given' });

});
