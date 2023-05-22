const db = require("../models");
const Settings = db.settings;
const Op = db.Sequelize.Op;

// Create and Save a new Settings
exports.createTimeSettings = (req, res) => {
  // Validate request
  if (!req.body.startTime) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // Check if time settings already exists then update it else create new one
  Settings.findAll().then((data) => {
    if (data.length > 0) {
      // Update time settings
      Settings.update(req.body, {
        where: { id: data[0].id },
      })
        .then((num) => {
          if (num == 1) {
            res.send({
              message: "Settings were updated successfully.",
            });
          } else {
            res.send({
              message: `Cannot update Settings with id=${id}. Maybe Settings was not found or req.body is empty!`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: "Error updating Settings with id=" + id,
          });
        });
    } else {
      // Create a Settings
      const settings = {
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      };

      // Save Settings in the database
      Settings.create(settings)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Settings.",
          });
        });
    }
  });
};

// Retrieve all Settings from the database.
exports.getAllTimeSettings = (req, res) => {
  // get time settings from database
  Settings.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving settings.",
      });
    });
};
