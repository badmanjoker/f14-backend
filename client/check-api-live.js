const http = require('http');

http.get('http://localhost:5000/api/products', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            const tee = products.find(p => p.slug === 'krakken-tee' || p.name.includes('KRAKKEN'));
            console.log('--- API LIVE RESPONSE FOR KRAKKEN TEE ---');
            console.log(JSON.stringify(tee, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
}).on('error', err => {
    console.error('Error fetching API:', err.message);
});
