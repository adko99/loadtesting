import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 10 }, // Ramp up to 10 users over 60 seconds
        { duration: '5m', target: 10 }, // Hold at 10 users for 5 minutes
    ]
};

export default function(){
    let apiTaskService = 'http://localhost:8900/';
    let randomNum = Math.floor(Math.random() * 100000);
    let url = apiTaskService + 'user';
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
    
    // Save user ID from response
    let userId = JSON.parse(res.body).id;
    console.log(`User ID: ${userId}`);

    sleep(1);

    let getUser = apiTaskService + 'user/' + userId;
    let getUserResponse = http.get(getUser);
    console.log(getUserResponse.status);
    check(getUserResponse, {
        'status is 200': (r) => r.status === 200,
        ['body contains email ' + email ]: (r) => r.body.includes(email)
        });
}