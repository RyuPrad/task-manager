const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticate = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');

// Start Google OAuth flow
router.get('/google', catchAsync(async (req, res) => {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: req.query.redirect || 'http://localhost:3000/auth/callback'
        }
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data.url);

}));

// OAuth callback - exchange code session
router.get('/callback', catchAsync(async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({
        message: 'Login successfull',
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.full_name
        }
    });
}));

// Get current user profile
router.get('/me', authenticate, catchAsync(async (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.user_metadata?.full_name,
        avatar: req.user.user_metadata?.avatar_url
    });
}));

module.exports = router;