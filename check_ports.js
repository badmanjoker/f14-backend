const net = require('net');

const ports = [3001, 5000, 5001];

ports.forEach(port => {
    const client = new net.Socket();
    client.setTimeout(1000);

    client.connect(port, '127.0.0.1', () => {
        console.log(`Port ${port} is OPEN`);
        client.destroy();
    });

    client.on('error', (err) => {
        console.log(`Port ${port} is CLOSED or Unreachable: ${err.message}`);
        client.destroy();
    });

    client.on('timeout', () => {
        console.log(`Port ${port} timed out`);
        client.destroy();
    });
});
