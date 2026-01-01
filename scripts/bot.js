const io = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3003";

const advertisers = [
  { id: "Nike", budget: () => 0.4 + Math.random() * 0.2 }, // 0.4 - 0.6
  { id: "Adidas", budget: () => 0.42 + Math.random() * 0.2 },
  { id: "Amazon", budget: () => 0.45 + Math.random() * 0.2 },
  { id: "GoogleAds", budget: () => 0.5 + Math.random() * 0.2 },
  { id: "MetaAds", budget: () => 0.48 + Math.random() * 0.2 },
];

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
});

function getCreativeFor(advertiserId) {
    return {
        headline: `Ad from ${advertiserId}`,
        cta: 'Learn More',
        image: `https://via.placeholder.com/300x250?text=${advertiserId}`,
        landingUrl: `https://${advertiserId.toLowerCase().replace('ads','')}.com`,
    };
}

socket.on('connect', () => {
    console.log('✅ Connected to server as advertising bot.');
});

socket.on('auction_created', (auction) => {
    console.log(`🔔 Auction created: ${auction.id}. Floor price: ${auction.floorPrice}`);

    advertisers.forEach((advertiser, index) => {
        // 50-80% participation rate
        if (Math.random() < (0.5 + Math.random() * 0.3)) {
            setTimeout(() => {
                const bidAmount = auction.floorPrice + advertiser.budget();
                const bid = {
                    auctionId: auction.id,
                    advertiserId: advertiser.id,
                    amount: parseFloat(bidAmount.toFixed(4)),
                    creative: getCreativeFor(advertiser.id),
                };
                socket.emit('submit_bid', bid);
                console.log(`💸 ${advertiser.id} submitted bid of ${bid.amount} for auction ${auction.id}`);
            }, 150 * index); // Stagger bids
        }
    });
});

socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server.');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
});