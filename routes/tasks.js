const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const authenticate = require('../middleware/auth');
const {
    createTaskRules,
    updateTaskRules,
    idParamRules,
    getTasksRules
} = require('../validators/taskValidator');

// All task routes require authentication
router.use(authenticate);

// CREATE
router.post('/', createTaskRules, catchAsync(async (req, res) => {
    const { title, description} = req.body;

    const result = await pool.query(
        'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, description || '', req.user.id]
    );

    res.status(201).json(result.rows[0]);
}));

// READ ALL (with pagination, filtering, search, sort)
router.get('/', getTasksRules, catchAsync(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'created_at';
    const order = req.query.order || 'desc';

    const conditions = ['user_id = $1'];
    const values = [req.user.id];
    let paramCount = 1;

    if (req.query.completed !== undefined) {
        paramCount++;
        conditions.push(`completed = $${paramCount}`);
        values.push(req.query.completed);
    }

    if (req.query.search) {
        paramCount++;
        conditions.push(`title ILIKE $${paramCount}`);
        values.push(`%${req.query.search}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM tasks ${whereClause}`,
        values
    );
    const totalTasks = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTasks / limit);

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

// READ one
router.get('/:id', idParamRules, catchAsync(async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
        throw new AppError('Task not found', 404);
    }

    res.json(result.rows[0]);
}));

// UPDATE
router.put('/:id', idParamRules, updateTaskRules, catchAsync( async (req, res) => {
    const { title, description, completed } = req.body;

    const result = await pool.query(
        `UPDATE tasks
        SET TITLE = COALESCE($1, title),
            description = COALESCE($2, description),
            completed = COALESCE($3, completed)
        WHERE id = $4 AND user_id = $5
        RETURNING *`,
        [title, description, completed, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
        throw new AppError('Task not found', 404);
    }

    res.json(result.rows[0]);
}));

// DELETE 
router.delete('/:id', idParamRules, catchAsync( async (req, res) => {
    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
        throw new AppError('Task not found', 404);
    }

    res.json({ message: 'Task deleted', task: result.rows[0]});
}));

module.exports = router;