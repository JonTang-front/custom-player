export default {
    async reconnect(url, params) {
        const res = await fetch(url, {
            body: JSON.stringify(params),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        if(res.ok){
            return res.json();
        }else{
            console.error(res.json().message);
            return Promise.reject();
        }
    },
    async startStream(url, params) {
        const res = await fetch(url, {
            body: JSON.stringify(params),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        if(res.ok){
            return res.json();
        }else{
            console.error(res.json().message);
            return Promise.reject();
        }
    },
    async stopStream(url, params) {
        const res = await fetch(url, {
            body: JSON.stringify(params),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        if(res.ok){
            return res.json();
        }else{
            console.error(res.json().message);
            return Promise.reject();
        }
    }
}