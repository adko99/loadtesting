import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';


export let options = {
    vus: 1,
    httpDebug: 'full', // Enable full HTTP debug logs
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)'], // Customize summary stats
};


export default function(){
    let randomNum = Math.floor(Math.random() * 100000);
    let url='http://localhost:8900/user';
    let email = 'aadamkowa+'+randomNum+'@gmail.com';

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

    let res = http.post(url,payload,params);
    console.log(res.status);
    check(res, {
        'status is 201': (r) => r.status === 201,
        'response is JSON': (r) => r.headers['Content-Type'] === 'application/json',
    });

    sleep(5);

    let getAllUsers='http://localhost:8900/user';
    let getAllUsersResponse = http.get(getAllUsers);
    console.log(getAllUsersResponse.status);
    check(getAllUsersResponse, {
        'status is 200': (r) => r.status === 200,
        ['body contains email ' + email]: (r) => r.body.includes(email)
        });
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Print summary to stdout
        'report.html': textSummary(data, { indent: ' ', enableColors: true }), // Save summary to HTML file
        'reportv2.html': htmlReport(data),
    };
}