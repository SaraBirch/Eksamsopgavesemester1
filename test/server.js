
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();
chai.use(chaiHttp);
//Our parent block
describe('Login', () => {
  describe('Login to server with correct credentials ', () => {
    let param = {username : 'sara0402', password : 'kode'}
      it('it should login to system', (done) => {
        chai.request(server)
            .post('/authenticate')
            .send(param)
            .end((err, res) => {
                  res.should.have.status(200);
              done();
            });
      });
  });

  describe('Login to server with wrong credentials', () => {
    let param = {username : 'sara0402', password : 'kode1234'}
      it('it should not login to system b/c password is wrong expect return 404', (done) => {
        chai.request(server)
            .post('/authenticate')
            .send(param)
            .end((err, res) => {
                  res.should.have.status(404);
              done();
            });
      });
  });

});
// code from /test/..server.js
