const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
    console.log('Client connected');

    
    setInterval(() => {
        const weatherUpdate = {
            type: 'weather-update',
            data: {
                temp: (Math.random() * 10 + 25).toFixed(1), 
                weather: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)] 
            }
        };
        socket.send(JSON.stringify(weatherUpdate));
    }, 5000);

    
    setInterval(() => {
        const newsUpdate = {
            type: 'news-update',
            data: [
                { title: 'Mock Philippine News 1', url: '#', publishedAt: new Date().toISOString(), urlToImage: 'https://via.placeholder.com/150', description: 'This is a mock Philippine news update 1.' },
                { title: 'Mock Philippine News 2', url: '#', publishedAt: new Date().toISOString(), urlToImage: 'https://via.placeholder.com/150', description: 'This is a mock Philippine news update 2.' }
            ]
        };
        socket.send(JSON.stringify(newsUpdate));
    }, 10000);

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on ws://localhost:8080');
