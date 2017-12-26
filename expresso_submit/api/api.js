//Import necessary routers and export the apiRouter.
const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employees.js');
const menusRouter = require('./menus.js');

apiRouter.use('/employees', employeesRouter); //Use employeesRouter when request path includes '/employees'
apiRouter.use('/menus', menusRouter); //Use menusRouter when request path includes '/menus'

module.exports = apiRouter;
