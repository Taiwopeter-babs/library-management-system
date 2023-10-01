/// <reference path="./test.d.ts" />

import axios from 'axios';
import { expect } from 'chai';

import testUtil from './utils';
import { test } from 'mocha';

describe('User Tests', function () {
    this.timeout('30s');
    it.skip('should create a new user', async function () {
        return axios({
            method: 'post',
            data: { ...testUtil.testUser },
            url: `${testUtil.baseUrl}/users`,
            headers: { Cookie: `rememberUser=${testUtil.cookieStr}` },
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.data).to.have.property('id');
            expect(response.data).to.have.property('books');
            expect(response.data['id']).to.be.a('string');
            expect(response.data['books']).to.be.a('array');
            expect(response.data['email']).to.equal(testUtil.testUser.email);
            expect(response.data['name']).to.equal(testUtil.testUser.name);
        });
    });

    it('should return the list of users', async function () {
        return axios({
            method: 'get',
            url: `${testUtil.baseUrl}/users`,
            headers: { Cookie: `rememberUser=${testUtil.cookieStr}` },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.data).to.be.a('array');
            expect(response.data.length).to.not.be.equal(0);
        });
    });

    it('should get a user by id', async function () {
        return axios({
            method: 'get',
            url: `${testUtil.baseUrl}/users/id/${testUtil.testUser.id}`,
            headers: { Cookie: `rememberUser=${testUtil.cookieStr}` },
        }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('id');
            if (response.data.books !== undefined) {
                expect(response.data['books']).to.be.a('array');
            }
        });
    });

    // Use async/await more. especially for integration tests
    it('should get a user by email', async function () {
        const response = await axios({
            method: 'get',
            url: `${testUtil.baseUrl}/users/email/${testUtil.testUser.email}`,
            headers: { Cookie: `rememberUser=${testUtil.cookieStr}` },
        })
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('email');
        if (response.data.books !== undefined) {
            expect(response.data['books']).to.be.a('array');
        }
        expect(response.data.email).to.equal(testUtil.testUser.email)

    });

})