const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//If timesheetId is found in the path, check that timesheet is found in the database and go to next.
//If not found, send 404
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//Get all timesheets with requested eployeeId. Not found employeeIds are handled in employees.js
timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
  const values = { $employeeId: req.params.employeeId};
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

//Create a new timesheet with info from request body if all necessary values are provided
timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;
        employeeId = req.body.timesheet.employeeId;
  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date) { //Missing information
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
          'VALUES ($hours, $rate, $date, $employeeId)';
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            (error, timesheet) => {
              res.status(201).json({timesheet: timesheet});
            });
        }
      });
    }
  });
});

//Update a timesheet with info from request body if all necessary values are provided
//Return status 400 if missing info
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;
        employeeId = req.body.timesheet.employeeId;
  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date) { //Missing information
        return res.sendStatus(400);
      }

      const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
          'date = $date ' +
          'WHERE Timesheet.id = $timesheetId';
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: req.params.timesheetId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
            (error, timesheet) => {
              res.status(200).json({timesheet: timesheet});
            });
        }
      });
    }
  });
});

//Delete the timesheet with provided id from the database.
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: req.params.timesheetId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
