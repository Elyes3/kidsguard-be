const express = require('express');
const envs = require('dotenv').config();
const userRoute = require('./routes/user_routes');
const app = express();
const cors = require('cors');
const http = require('http');
app.use(express.json());
const server = http.createServer(app);
app.use(cors({
    origin: '*' // ALLOW ALL MUST BE REVERTED IN PRODUCTION
}))
userRoute(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});