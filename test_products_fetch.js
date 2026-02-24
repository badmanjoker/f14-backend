async function checkProducts() {
    try {
        console.log('Fetching products from http://localhost:5001/api/products...');
        const res = await fetch('http://localhost:5001/api/products');

        if (!res.ok) {
            console.error('Failed to fetch:', res.status, res.statusText);
            const text = await res.text();
            console.error('Response:', text);
            return;
        }

        const data = await res.json();
        console.log(`Successfully fetched ${data.length} products.`);

        if (data.length > 0) {
            console.log('First product sample:');
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log('Product list is empty!');
        }

    } catch (error) {
        console.error('Error executing fetch:', error);
    }
}

checkProducts();
