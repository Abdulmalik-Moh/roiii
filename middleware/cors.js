// [file name]: cors.js
// [file content begin]
const cors = require('cors');

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, file://)
    if (!origin) return callback(null, true);
    
    // Allow localhost origins
    if (origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes('file://')) {
      return callback(null, true);
    }
    
    // For production, add your domain here
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
// [file content end]