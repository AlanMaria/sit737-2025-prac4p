const express = require('express');
const winston = require('winston');
const axios = require('axios');

const app = express();
const port = 3000;

// Winston Logger Setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-microservice' },
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Function to Perform Arithmetic Operations
const performOperation = (operation, num1, num2) => {
    switch (operation) {
        case 'add': return num1 + num2;
        case 'subtract': return num1 - num2;
        case 'multiply': return num1 * num2;
        case 'divide': 
            if (num2 === 0) {
                logger.error(`Division by zero error: num1=${num1}, num2=${num2}`);
                return 'Error: Division by zero';
            }
            return num1 / num2;
        default: return 'Error: Invalid operation';
    }
};

// API Endpoints for Arithmetic Operations
app.get('/:operation', (req, res) => {
    const { operation } = req.params;
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        logger.error(`Invalid input: num1=${req.query.num1}, num2=${req.query.num2}`);
        return res.status(400).json({ error: 'Invalid input numbers' });
    }

    const result = performOperation(operation, num1, num2);

    // Log error separately for division by zero
    if (operation === 'divide' && num2 === 0) {
        return res.status(400).json({ error: 'Cannot divide by zero' });
    }

    logger.info(`Operation: ${operation}, Numbers: ${num1}, ${num2}, Result: ${result}`);
    res.json({ operation, num1, num2, result });
});

// External API Call Using Axios (Example: Fetching Random User)
app.get('/external-api', async (req, res) => {
    try {
        const response = await axios.get('https://randomuser.me/api/');
        logger.info('External API request successful');
        res.json(response.data);
    } catch (error) {
        logger.error(`Error calling external API: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Start the Server
app.listen(port, () => {
    logger.info(`Calculator microservice running at http://localhost:${port}`);
});
