const { createClient } = require('@supabase/supabase-js');
const AppError = require('../utils/AppError');

async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Create a client with the user's token to verify it
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: { Authorization: `Bearer ${token}`}
            }
        }
    );

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        throw new AppError('Invalid or expired token', 401);
    }

    // Attach user to the request object
    req.user = data.user;
    next();
}

module.exports = authenticate;