import http from 'k6/http';
import { check} from 'k6';

export let options = {
    vus: 1
};

export default function(){
    let url='http://localhost:8900/user';
    let res = http.get(url);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'body contains expected text': (r) => r.body.includes('expected text'),
        'response is JSON': (r) => r.headers['Content-Type'] === 'application/json'
        });
}