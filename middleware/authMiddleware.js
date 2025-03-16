const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const sendErrorResponse = (res, statusCode, status, message) => {
    return res.status(statusCode).json({
        status,
        message
    })
};



// Verify JWT Token
const protect = async (req, res, next) => {
    try {
        let token;

        //Checking if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendErrorResponse(res, 401, 'fail', 'Not authorized, no token provided');
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        //Find User by id
        const user = await User.findById(decode.id).select('-password');

        if (!user) {
            return sendErrorResponse(res, 401, 'fail', 'Not authorized, user not found');
        }

        // Attach user to request object
        req.user = user;
        next()
    } catch(error) {
        if (error.name === 'JsonWebTokenError') {
            return sendErrorResponse(res, 401, 'fail', 'Not authorized, invalid token');
          }
          
          if (error.name === 'TokenExpiredError') {
            return sendErrorResponse(res, 401, 'fail', 'Not authorized, token expired');
          }
          
          return sendErrorResponse(res, 500, 'error', 'Server error');
        }
};


//Restrict routes to specific roles

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendErrorResponse(
                res,
                403, 'fail',

            )
        }
        next();
    }
}

module.exports = { protect, restrictTo};