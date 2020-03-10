const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { ValidationError } = require('express-validation')

/**
 * ROUTES
 */
const userRoutes = require('./api/routes/users');

app.use(bodyParser.json({ type: 'application/json' }));
app.use('/users', userRoutes);

/**
 * ERROR HANDLING
 */
app.use(function(err, req, res, next) {
	if (err instanceof ValidationError) {
		return res.status(err.statusCode).json(err)
	}
	return res.status(500).json(err)
});

module.exports = app;