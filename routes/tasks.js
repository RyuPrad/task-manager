const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
    createTaskRules,
    updateTaskRules,
    idParamRules,
    getTaskRules
} = require('../validators/taskValidator');

router.post('/', createTaskRules, catchAsync(async (req, res) => {
    const { title, description } = req.body;

    const result = await pool.query(
        'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
        [title, description || '']
    );

    res.status(201).json(result.rows[0]);
}));

// Read all (with pagination, filtering, search, sort)
router.get('/', getTaskRules, catchAsync(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'created_at';
    const order = req.query.order || 'desc';

    const conditions = [];
    const values = [];
    let paramCount = 0;

    // Filter by completed status
    if (req.query.completed !== undefined) {
        paramCount++;
        conditions.push(`completed = $${paramCount}`);
        values.push(req.query.completed);
    }

    // Search by title
    if (req.query.search) {
        paramCount++;
        conditions.push(`title ILIKE $${paramCount}`);
        values.push(`%${req.query.search}%`);
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    // Get total count for pagination metadata
    const countResult = await pool.query(
        `SELECT COUNT(*) FROM tasks ${whereClause}`,
        values
    );
    const totalTasks = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTasks / limit);

    // Get the actual tasks
    paramCount++;
    const limitParam = `$${paramCount}`;
    paramCount++;
    const offsetParam = `$${paramCount}`;

    const result = await pool.query(
        `SELECT * FROM tasks ${whereClause} ORDER BY ${sort} ${order} LIMIT ${limitParam} OFFSET ${offsetParam}`,
        [...values, limit, offset]
    );

    res.json({
        data: result.rows,
        pagination: {
            page, 
            limit,
            total_tasks: totalTasks,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
        }
    });
}));

router.get('/:id', idParamRules, catchAsync(async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
        throw new AppError('task not found', 404);
    }

    res.json(result.rows[0]);
}));

router.put('/:id', idParamRules, updateTaskRules, catchAsync(async (req, res) => {
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

router.delete('/:id', idParamRules, catchAsync(async (req, res) => {
    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING *',
        [req.params.id]
    );

    if (result.rows.length === 0) {
        throw new AppError('task not found', 404);
    }

    res.json({ message: 'task deleted', task: result.rows[0]});
}));

module.exports = router;