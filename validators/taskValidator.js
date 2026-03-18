const { body, param, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function handleValidation(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg);
        throw new AppError(messages.join(', '), 400); 
    }

    next();
}

const createTaskRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 225 }).withMessage('Title must be 255 characters or less')
        .escape(),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Description must be 2000 characters or less')
        .escape(),

    handleValidation
];

const updateTaskRules = [
    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title must not be empty')
        .isLength({ max: 225 }).withMessage('Title must 255 characters or less')
        .escape(),

    body('description')  
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Description must 2000 characters or less') 
        .escape(),

    body('completed')
        .optional()
        .isBoolean().withMessage('Completed must be true or false'),

    handleValidation
];

const idParamRules = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID must be a positive integer'),

    handleValidation
];

module.exports = { createTaskRules, updateTaskRules, idParamRules };