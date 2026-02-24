const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

async function simulatePut() {
    const API_URL = 'http://localhost:5000';
    const productId = '698d240a842279def7e28711'; // BAGGY SWEATS

    // Generate token
    const secret = 'fallback_secret_do_not_use_in_prod';
    const token = jwt.sign({ id: 'admin' }, secret);

    console.log('Simulating PUT for ID:', productId);

    const body = {
        name: "BAGGY SWEATS (UPDATED)",
        price: 50,
        sizeGuide: "tee"
    };

    try {
        const res = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        console.log('Response:', res.status, data);
    } catch (err) {
        console.error('Error:', err);
    }
}

simulatePut();
