const io = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3003";

const publishers = [
  "cnn.com",
  "nytimes.com",
  "techcrunch.com",
  "reddit.com",
  "medium.com",
];
const adSlots = [
  "banner_top",
  "sidebar_right",
  "in_article_video",
  "native_feed",
  "interstitial",
  "video_pre_roll",
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloorPrice() {
  return (Math.random() * (0.04 - 0.015) + 0.015).toFixed(4);
}

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
});

socket.on('connect', () => {
    console.log('✅ Connected to server as simulated user.');
    
    setInterval(() => {
        const auctionData = {
            publisherId: getRandomElement(publishers),
            adSlotId: getRandomElement(adSlots),
            floorPrice: parseFloat(getRandomFloorPrice()),
        };
        socket.emit('create_auction', auctionData);
        console.log(`🚀 Emitted create_auction for ${auctionData.publisherId} (${auctionData.adSlotId})`);
    }, Math.random() * (8000 - 2000) + 2000);
});

socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server.');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
});