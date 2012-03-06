
/*
 * GET home page.
 */

exports.index = function (req, res) {
	res.render('index', { title: 'Slave' })
};

exports.master = function (req, res) {
	res.render('index', { title: 'Master' })
};