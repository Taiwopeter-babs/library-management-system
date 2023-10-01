/// <reference path="./test.d.ts" />

import axios from 'axios';
import { expect } from 'chai';

import testUtil from './utils';

const baseUrl = 'http://0.0.0.0:5000/api';

describe('Librarian Tests', function () {
    this.timeout('100s');
    it('should return an unauthorized request error', function (done) {

        axios.get(`${baseUrl}/users`)
            .then((response) => {
                expect(response.data).to.have.property('error');
                expect(response.status).to.equal(401);
            });
        done();
    });

    it('should return a bad resquest error for missing email', function (done) {
        axios({
            method: 'post',
            url: `${baseUrl}/librarians`,
            data: {},
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            expect(response.data).to.have.property('error');
            expect(response.status).to.equal(400);
            expect(response.status).to.deep.equal({ error: 'Missing email' });
            // done();
        });
        done();
    });

    it('should return a bad request error for missing name', function (done) {
        axios({
            method: 'post',
            url: `${baseUrl}/librarians`,
            data: { email: 'test@email.com' },
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            expect(response.data).to.have.property('error');
            expect(response.status).to.equal(400);
            expect(response.data).to.deep.equal({ error: 'Missing name' });
            // done();
        });
        done();
    });


    it.skip('should create a new librarian', function (done) {
        this.timeout(10000);
        axios({
            method: 'post',
            url: `${baseUrl}/librarians`,
            data: { email: 'test@email.com', name: "test name" },
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            console.log(response.data);
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('org_email');
            expect(response.data).to.have.property('password');
            expect(response.data).to.have.property('message');
            expect(response.headers['set-cookie']).to.not.be.empty;
            expect(response.headers['set-cookie']).to.be.a('string');
            // done();
        });
        done();
    });
})

describe('Librarian Login Tests', function () {
    this.timeout('60s');

    it('should respond with a bad request for missing org_email', function () {
        axios({
            method: 'post',
            url: `${baseUrl}/librarians/login`,
            data: {},
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            expect(response.status).to.equal(400);
            expect(response.data).to.have.property('error');
        });
    });

    it('should respond with a bad request for missing password', function () {
        axios({
            method: 'post',
            url: `${baseUrl}/librarians/login`,
            data: { org_email: 'test_name_ka9@lmsmail.com' },
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            expect(response.status).to.equal(400);
            expect(response.data).to.have.property('error');
        });
    });

    it('should respond with a bad request for wrong password', function () {
        axios({
            method: 'post',
            url: `${baseUrl}/librarians/login`,
            data: { org_email: 'test_name_ka9@lmsmail.com', password: 'incorrect' },
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            expect(response.status).to.equal(404);
            expect(response.data).to.have.property('error');
        });
    });

    it.skip('should respond with a 200 OK for login', function () {
        const dataLogin = {
            org_email: 'test_name_ka9@lmsmail.com',
            password: 'Z1gj90pSEquD'
        };
        axios({
            method: 'post',
            url: `${baseUrl}/librarians/login`,
            data: dataLogin,
            headers: { "Content-Type": "application/json" },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('org_email');
            expect(response.data.org_email).to.equal(dataLogin.org_email);
            expect(response.data).to.not.have.property('error');
        });
    });
});

describe('First successful query with cookie', function () {
    this.timeout('60s');

    it('should query all users and return a 200 status', function () {
        axios({
            method: 'get',
            url: `${baseUrl}/users`,
            headers: { "Set-Cookie": testUtil.cookieStr },
        }).then((response) => {
            console.log(response.data);
            expect(response.status).to.equal(200);
            expect(response.data).to.be.a('string');
            expect(response.data).to.be.empty;
        });
    })
})