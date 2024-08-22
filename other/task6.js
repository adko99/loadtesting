import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

let apiTaskService = 'http://localhost:8900/';

export let options = {
    scenarios: {
        flowA: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10s', target: 5 }, // Ramp up to 5 users over 1 minute
                { duration: '10s', target: 5 }, // Hold at 5 users for 4 minutes
            ],
            exec: 'flowA',
        },
        flowB: {
            executor: 'constant-vus',
            vus: 1,
            duration: '20s',
            exec: 'flowB',
        },
    },
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)'], // Customize summary stats
};

export function flowA() {
    group('Create and Retrieve User', function () {
        let randomNum = Math.floor(Math.random() * 100000);
        let url = apiTaskService + 'user';
        let email = 'aaadamkowa+' + randomNum + '@gmail.com';

        let payload = JSON.stringify({
            email: email,
            name: 'adam',
            surname: 'kowalski'
        });

        let params = {
            headers: {
                'Content-Type': 'application/json'
            },
            tags: { name: 'CreateUser' }
        };

        let res = http.post(url, payload, params);
        console.log(res.status);
        check(res, {
            'status is 201': (r) => r.status === 201,
            'response is JSON': (r) => r.headers['Content-Type'] === 'application/json',
        });

        sleep(1);

        // Save user ID from response
        let userId = JSON.parse(res.body).id;
        console.log(`User ID: ${userId}`);

        sleep(1);

        let getUser = apiTaskService + 'user/' + userId;
        let getUserResponse = http.get(getUser, { tags: { name: 'GetUser' } });
        console.log(getUserResponse.status);
        check(getUserResponse, {
            'status is 200': (r) => r.status === 200,
            ['body contains email ' + email ]: (r) => r.body.includes(email)
        });
    });
}

export function flowB() {
    let getAllUsers = apiTaskService + 'user';
    let getAllUsersResponse = http.get(getAllUsers, { tags: { name: 'GetAllUsers' } });
    console.log(getAllUsersResponse.status);
    check(getAllUsersResponse, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(5);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Print summary to stdout
        'report.html': textSummary(data, { indent: ' ', enableColors: true }), // Save summary to HTML file
        'reportv2.html': htmlReport(data),
    };
}