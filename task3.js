import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Load email addresses from a file
const emails = new SharedArray('emails', function() {
    return JSON.parse(open('./emails.json'));
});

export let options = {
    vus: 1,
    iterations: 10
};

export default function() {
    let url = 'http://localhost:8900/user';
    let email = emails[__ITER % emails.length]; // Use the current iteration to get the email

    let payload = JSON.stringify({
        email: email,
        name: 'adam',
        surname: 'kowalski'
    });

    let params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let res = http.post(url, payload, params);
    console.log(res.status);
    check(res, {
        'status is 201': (r) => r.status === 201,
        'response is JSON': (r) => r.headers['Content-Type'] === 'application/json',
    });

    sleep(5);

    let getAllUsers = 'http://localhost:8900/user';
    let getAllUsersResponse = http.get(getAllUsers);
    console.log(getAllUsersResponse.status);
    check(getAllUsersResponse, {
        'status is 200': (r) => r.status === 200,
        [`body contains email ${email}`]: (r) => r.body.includes(email)
    });
}