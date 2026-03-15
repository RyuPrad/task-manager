const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');

let tasks = [];
let nextId = 1;

function findTask(id) {
    const task = tasks.find(t => t.id === parseInt(id));
    
    if (!task) {
        throw new AppError('Task not found', 404);
    }

    return task;
}

router.post('/', (req, res) => {

    const { title, description} = req.body;

    if (!title) {
        throw new AppError('Title is required', 400);
    }

    const task = {
        id: nextId++,
        title,
        description: description || '',
        completed: false,
        createdAt: new Date().toISOString
    }

    tasks.push(task);
    res.status(201).json(task);
});

router.get('/', (req, res) => {
    res.json(tasks);
});

router.get('/:id', (req, res) => {

    const task = findTask(req.params.id);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    res.json(task);
});

router.put('/', (req, res) => {

    const task = findTask(req.params.id);

    if (!task) {
        throw new AppError('task not found', 404);
    }

    const { title, description, completed } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    
    res.json(task);
});

router.delete('/', (req, res) => {

    const index = tasks.findIndex(t => t.id === parseInt(req.params.id));

    if (index === -1) {
        throw new AppError('task not found', 404);
    }

    const deleted = tasks.splice(index, 1);
    res.json({ message:'task deleted', task: deleted[0]});
});

module.exports = router;