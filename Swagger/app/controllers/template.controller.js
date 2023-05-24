const { validateTemplate } = require("../middlewares/validations.middleware");
const db = require("../models");
const Templates = db.templates;
const Op = db.Sequelize.Op;

// Create and Save a new Templates
exports.createTemplate = async (req, res) => {

  const { title, subject, body } = req.body;
  const template = {
    title: title,
    subject: subject,
    body: body,
  };

  // validate Template object from request body
  await validateTemplate(
    template,
    (onSuccess) => {
      // Save Templates in the database
      Templates.create(template)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message ||
              "Some error occurred while creating the Templates.",
          });
        });
    },
    (onError) => {
      res.status(500).send({
        message: "Template object is not valid.",
      });
    }
  );
};

// Update a Templates by the title in the request
exports.updateTemplate = (req, res) => {
  const id = req.params.id;

  Templates.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Templates was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Templates with id=${id}. Maybe Templates was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Templates with id=" + id,
      });
    });
};

// Get all templates from the database.
exports.findAllTemplates = (req, res) => {
  const id = req.query.id;
  var condition = id ? { id: { [Op.like]: `%${id}%` } } : null;

  Templates.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving templates.",
      });
    });
};

// Get a single Templates with id
exports.findOneTemplate = (req, res) => {
  const id = req.params.id;

  Templates.findOne({ where: { id: id } })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Templates with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Templates with id=" + id,
      });
    });
};

// Delete a Templates with the specified id in the request
exports.deleteTemplateById = (req, res) => {
  const {id} = req.body;

  Templates.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Templates was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Templates with id=${id}. Maybe Templates was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Templates with id=" + id,
      });
    });
}

// Delete all Templates from the database.
exports.deleteAllTemplates = (req, res) => {
  Templates.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Templates were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all templates.",
      });
    });
}
