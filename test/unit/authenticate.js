// Load modules

var Travelogue = require('../../');
var Lab = require('lab');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;
var LocalStrategy = require('passport-local');


describe('#authenticate', function () {

    it('should accept function in place of options', function (done) {

        var authenticate = Travelogue.internals.authenticate('local', function (err) {});
        expect(authenticate).to.exist;
        done();
    });
    
    describe('#backupNext', function () {

        it('should redirect to success URL if no error given', function (done) {

            
            var options = {
                successRedirect: '/success'
            };
            var reqMock = {
                reply: {}
            };
            reqMock.reply.redirect = function (url) {

                expect(url).to.exist;
                expect(url).to.equal(options.successRedirect);
                done();
            };
            var backupNext = Travelogue.internals.backupNextFactory(reqMock, options);
            backupNext();
        });
    });
    
    describe('#allFailed', function () {

        var failureOne = {challenge: 1, status: 'test'};
        var failureTwo = {challenge: 2, status: 'test'};
        var failures = [failureOne, failureTwo];
        
        var strFailureOne = {challenge: 'fail1', status: 'test'};
        var strFailureTwo = {challenge: 'fail2', status: 'test'};
        var strFailures = [strFailureOne, strFailureTwo];

        it('should return callback if defined and handle case where one failure', function (done) {

            var failure = {challenge: 1, status: 'test'};
            var allFailed = Travelogue.internals.allFailedFactory({}, [failure], {}, function (err, success, challenge, status) {

                expect(err).to.not.exist;
                expect(success).to.equal(false);
                expect(challenge).to.equal(failure.challenge);
                expect(status).to.equal(failure.status);
                done();
            });
            allFailed();
        });
        
        it('should return callback if defined and handle case where failures', function (done) {

            
            var allFailed = Travelogue.internals.allFailedFactory({}, failures, {}, function (err, success, challenges, statuses) {

                expect(err).to.not.exist;
                expect(success).to.equal(false);
                
                failures.forEach(function (el, index) {

                    expect(el.challenge).to.equal(challenges[index]);
                    expect(el.status).to.equal(statuses[index]);
                });
                done();
            });
            allFailed();
        });
        
        it('should set status to challenge if given number, no callback given', function (done) {

            var reqMock = {};
            reqMock.reply = function (response) {

                // nothing to test, just for coverage
                done();
            };
            
            var allFailed = Travelogue.internals.allFailedFactory(reqMock, failures, {});
            allFailed();
        });
        
        it('should return Unauthorized challenge if given string, no callback given', function (done) {

            var reqMock = {};
            reqMock.reply = function (response) {

                var expectedVal = strFailures.map(function(d){ return d.challenge; }).join(', ')
                expect(response.response.headers['WWW-Authenticate']).to.equal(expectedVal);
                done();
            };
            
            var allFailed = Travelogue.internals.allFailedFactory(reqMock, strFailures, {});
            allFailed();
        });
    });

    describe('#transformAuthInfoCallback', function () {

        var error = true;
        var reqMock = {};
        
        it('should return err on err', function (done) {

            var cbMock = function (err) {

                expect(err).to.exist;
                expect(err).to.equal(error);
                done();
            };
            var completeMock = function () {

                done();
            };
            var transformAuthInfoCallback = Travelogue.internals.transformAuthInfoCallback(reqMock, cbMock, completeMock);
            transformAuthInfoCallback(error);
        });
    });
    
    describe('#delegateErrorFactory', function () {

        var error = true;
        
        it('should return err on err', function (done) {

            var cbMock = function (err) {

                expect(err).to.exist;
                expect(err.trace).to.exist;
                expect(err.message.split(':').pop().slice(1)).to.equal(error.toString());
                done();
            };
            var delegateError = Travelogue.internals.delegateErrorFactory(cbMock);
            delegateError(error);
        });
    });
    
    describe('#delegateRedirectFactory', function () {

        var expectedUrl = '/test'
        var reqMock = {
            reply: {}
        };
        
        it('should return a redirect given a url', function (done) {

            reqMock.reply.redirect = function (url) {

                expect(url).to.exist;
                expect(url).to.equal(expectedUrl);
                done();
            };
            var delegateRedirect = Travelogue.internals.delegateRedirectFactory(reqMock);
            delegateRedirect(expectedUrl);
        });
    });
    
    describe('#actionsFactory', function () {

        var expectedUrl = '/test';
        var error = 'testing';
        
        it('should return a redirect when called', function (done) {

            var reqMock = {
                reply: {}
            };
            reqMock.reply.redirect = function (url) {

                expect(url).to.exist;
                expect(url).to.equal(expectedUrl);
                done();
            };
            var delegateMock = {};
            delegateMock.redirect = Travelogue.internals.delegateRedirectFactory(reqMock);

            var actions = Travelogue.internals.actionsFactory();
            actions.redirect.call(delegateMock, expectedUrl);
        });
        
        it('should return an error when called', function (done) {

            var cbMock = function (err) {

                expect(err).to.exist;
                expect(err.trace).to.exist;
                expect(err.message.split(':').pop().slice(1)).to.equal(error.toString());
                done();
            };
            var delegateMock = {};
            delegateMock.error = Travelogue.internals.delegateErrorFactory(cbMock);

            var actions = Travelogue.internals.actionsFactory();
            actions.error.call(delegateMock, error);
        });
    });
});