const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

router.post('/', catchAsync(async (req, res) => {

    const { title, description } = req.body;

    if (!title) {
        throw new AppError('title is required', 400);
    }

    const result = await pool.query(`
        INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *`,
        [title, description || '']
    );

    res.status(201).json(result.rows[0]);
}));

router.get('/', catchAsync(async(req, res) => {

    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
}));

router.get('/:id', catchAsync(async(req, res) => {

    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
        throw new AppError('task not found', 404);
    }

    res.json(result.rows[0]);
}));

router.put('/:id', catchAsync(async(req, res) => {

    const { title, description, completed } = req.body;

    const result = await pool.query(
        `UPDATE tasks
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            completed = COALESCE($3, completed)
        WHERE id = $4
        RETURNING *`,
        [title, description, completed, req.params.id]
    );

    if (result.rows.length === 0) {
        throw new AppError('task not found', 404);
    }

    res.json(result.rows[0]);
}));

router.delete('/:id', catchAsync(async(req, res) => {

    const result = await pool.query(
        'DELETE tasks FROM WHERE id = $1 RETURNING *', [req.params.id]
    );

    if (result.rows.length === 0) {
        throw new AppError('task not found', 404);
    }

    res.json({ message: 'task deleted', task: result.rows[0]});
}));

module.exports = router;