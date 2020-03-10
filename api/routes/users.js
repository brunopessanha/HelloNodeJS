const express = require('express');
const router = express.Router();

const { validate, ValidationError, Joi } = require('express-validation')
const postalCodes = require('postal-codes-js');
var countries = require("i18n-iso-countries");

/**
 * VALIDATIONS
 */
const passwordValidation = {
	body: Joi.object({
		current_password: Joi.string()
			.required(),
		new_password: Joi.string()
			.disallow(Joi.ref('current_password')) //cannot be the same as the previous password
			.regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/) //one digit, one lower, one upper and size 8
			.required(),
	}),
}
/** 
 * 
*/

/**
 * My hard coded repository
 */
const fake_user  = {
	first_name: "Bruno",
	last_name: "Pessanha de Carvalho",
	passport_number: "ABC-123456",
	address: {
		street: "Berliner Straße 10",
		postal_code: "90304",
		country: "DE",
	},
	email: "brunopdec@gmail.com",
	password: "1a2w3e4r5t",
	user_name: "brunopessanha",
	avatar: "https://s.gravatar.com/avatar/40f68b60ccf1f19a662548f58a4fce2f?s=80"
};


/**
 * GET /users/:id
 */
router.get('/:id', (req, res, next) => {
	/* Get user from DB */
	let current_user = fake_user;
	delete current_user.password;
	res.status(200).json(current_user);
});


/**
 * PATCH /users
 */
router.patch('/:id', (req, res) => {

	let current_user = fake_user; /*TODO: get from logged in user*/
	delete current_user.password;
	let args = { result: true };

	const user_update = req.body;

	updateUserName(user_update, current_user);
	updateAddress(user_update, current_user, args);

	if (args.result !== true) {
		res.status(400).json({
			message: args.result
		});
	}

	res.status(200).json({
		message: "User was updated succesfully.",
		user: current_user
	});
});


/**
 * PUT /users/:id/password
 */
router.put('/:id/password', validate(passwordValidation), (req, res) => {

	let current_user = fake_user; /*TODO: get from logged in user*/
	const password_update = req.body;

	if (password_update.current_password != current_user.password) { 
		res.status(400).json({
			message: "You have entered an invalid username or password."
		});
	}

	current_user.password = password_update.new_password;

	res.status(200).json({
		message: "Password was updated."
	});
});

module.exports = router;

/** 
 * PRIVATE FUNCTIONS
*/

function updateUserName(user_update, current_user) {
	if (user_update.last_name != null || undefined)
		current_user.last_name = user_update.last_name;
}

function updateAddress(user_update, current_user, args) {
	if (user_update.address != null || undefined) {

		if (current_user.address == null || undefined)
			current_user.address = {};

		if (user_update.address.postal_code != null || undefined)
			current_user.address.postal_code = user_update.address.postal_code;

		if (user_update.address.street != null || undefined)
			current_user.address.street = user_update.address.street;

		if (user_update.address.country != null || undefined) {

			if (!countries.isValid(user_update.address.country)) {
				args.result = "Invalid country";
			} else if (user_update.address.country.toLowerCase() !== "de" 
				&& user_update.address.country.toLowerCase() !== "fi" ) {
				args.result = "This app is only available in Germany and Finland";
			} else {
				current_user.address.country = user_update.address.country;
				args.result = postalCodes.validate(current_user.address.country, current_user.address.postal_code);
			}
		}
	}
}
