const { validateLead } = require("../middlewares/validations.middleware");

const db = require("../models");
const Leads = db.lead;
const Users = db.user;
const Op = db.Sequelize.Op;
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");

// send email and check whether email is sent or not
// exports.sendEmail=(req,res)=>{
//     // send email
//     const nodemailer=require('nodemailer');
//     const transporter=nodemailer.createTransport({
//         service:'gmail',
//         auth:{
//             user:'bhatti.net103@gmail.com',
//             pass: 'bhatti13'
//         }
//     });
//     const mailOptions={
//         from:'bhatti.net103@gmail.com',
//         to:req.body.email,
//         subject:'Sending Email using Node.js',
//         text:'That was easy!'
//     };
//     transporter.sendMail(mailOptions,(err,info)=>{
//         if(err){
//             res.status(500).send({
//                 message:err
//             });
//         }else{
//             res.status(200).send({
//                 message:'Email sent successfully!'
//             });
//         }
//     }
//     );

//     // check whether email is sent or not
// };

// Create and Save a new Lead
exports.createLead = async (req, res, next) => {
  // request is valid but need to check wether userId exists or not
  const user = await Users.findOne({
    where: {
      id: req.body.userId,
    },
  });
  if (!user) {
    res.status(404).send({
      message: "User Not Found",
    });
    return;
  }

  if (!user.isApprovedByAdmin) {
    res.status(403).send({
      message: "User Not Authorized",
    });
    return;
  }
  // Validate request
  const lead = {
    companyName: req.body.companyName,
    companyBusinessWebsite: String(req.body.companyBusinessWebsite),
    title: req.body.title,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    telephone: req.body.telephone,
    recentJobPost: String(req.body.recentJobPost),
    sourceOfLead: String(req.body.sourceOfLead),
    jobPostingLink: String(req.body.jobPostingLink),
    industry: req.body.industry,
    companySize: req.body.companySize,
    companyLinkdin: String(req.body.companyLinkdin),
    leadStatus: req.body.leadStatus,
    personLinkedin: String(req.body.personLinkedin),
    postedBy: req.body.postedBy,
    country: req.body.country,
    sector: req.body.sector,
    emailSendingDate: req.body.emailSendingDate
      ? req.body.emailSendingDate
      : null,
    userId: parseInt(req.body.userId),
  };

  await validateLead(
    lead,
    (res) => {},
    (err) => {
      res.status(400).send({
        message: err.message || "Invalid Data",
      });
    }
  );

  // Create a Lead
  try {
    const data = await Leads.create(lead);
    res.status(200).send({
      message: "Lead created successfully!",
      data,
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({
        message: "Some error occurred while creating the Lead.",
      });
    }
    next();
  }
};

exports.deleteLead = async (req, res) => {
  const { email } = req.body;

  Leads.destroy({
    where: { email: email },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Lead was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Lead with id=${email}. Maybe Templates was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Lead",
      });
    });
};
// Retrieve all Leads from the database against a specific user.

// OLD CODE
// exports.getAllLeads = async (req, res) => {
//   const { fromDate,toDate, leadStatus, pageNumber, pageSize, searchString } = req.body;
//   // calculate limit and offset
//   const offset = pageNumber === 0 ? pageNumber : (pageNumber - 1) * pageSize;
//   const limit = pageSize;

//   const where = {};
//   if (leadStatus) {
//     where.leadStatus = leadStatus;
//   }
//   if (searchString) {
//     where[Op.or] = [
//       { companyName: { [Op.like]: `%${searchString}%` } },
//       { companyBusinessWebsite: { [Op.like]: `%${searchString}%` } },
//       { title: { [Op.like]: `%${searchString}%` } },
//       { firstName: { [Op.like]: `%${searchString}%` } },
//       { lastName: { [Op.like]: `%${searchString}%` } },
//       { email: { [Op.like]: `%${searchString}%` } },
//       { telephone: { [Op.like]: `%${searchString}%` } },
//       { recentJobPost: { [Op.like]: `%${searchString}%` } },
//       { sourceOfLead: { [Op.like]: `%${searchString}%` } },
//       { jobPostingLink: { [Op.like]: `%${searchString}%` } },
//       { industry: { [Op.like]: `%${searchString}%` } },
//       { companySize: { [Op.like]: `%${searchString}%` } },
//       { companyLinkdin: { [Op.like]: `%${searchString}%` } },
//       { personLinkedin: { [Op.like]: `%${searchString}%` } },
//       { postedBy: { [Op.like]: `%${searchString}%` } },
//       { country: { [Op.like]: `%${searchString}%` } },
//       { sector: { [Op.like]: `%${searchString}%` } },
//     ];
//   }

//   try {
//     const { count, rows } = await Leads.findAndCountAll({
//       where,
//       offset,
//       limit,
//     });
//     // return response with leads, total pages, and current page
//     res.json({
//       leads: rows,
//       totalPages: Math.ceil(count / pageSize),
//       currentPage: pageNumber,
//       totalCount: count,
//     });
//   } catch (error) {
//     res.status(500).send({
//       message: error.message || "Some error occurred while retrieving Leads.",
//     });
//   }
// };

// Replaced Code:
exports.getAllLeads = async (req, res) => {
  const { fromDate, toDate, leadStatus, pageNumber, pageSize, searchString } =
    req.body;
  const offset = pageNumber === 0 ? pageNumber : (pageNumber - 1) * pageSize;
  const limit = pageSize;

  const where = { leadStatus };

  if (searchString) {
    where[Op.or] = [
      { companyName: { [Op.like]: `%${searchString}%` } },
      { companyBusinessWebsite: { [Op.like]: `%${searchString}%` } },
      { title: { [Op.like]: `%${searchString}%` } },
      { firstName: { [Op.like]: `%${searchString}%` } },
      { lastName: { [Op.like]: `%${searchString}%` } },
      { email: { [Op.like]: `%${searchString}%` } },
      { telephone: { [Op.like]: `%${searchString}%` } },
      { recentJobPost: { [Op.like]: `%${searchString}%` } },
      { sourceOfLead: { [Op.like]: `%${searchString}%` } },
      { jobPostingLink: { [Op.like]: `%${searchString}%` } },
      { industry: { [Op.like]: `%${searchString}%` } },
      { companySize: { [Op.like]: `%${searchString}%` } },
      { companyLinkdin: { [Op.like]: `%${searchString}%` } },
      { personLinkedin: { [Op.like]: `%${searchString}%` } },
      { postedBy: { [Op.like]: `%${searchString}%` } },
      { country: { [Op.like]: `%${searchString}%` } },
      { sector: { [Op.like]: `%${searchString}%` } },
    ];
  }

  try {
    let count, rows;
    if (fromDate && !toDate) {
      const fromTimestamp = new Date(`${fromDate}T00:00:00.000Z`);
      where.createdAt = { [Op.gte]: fromTimestamp };
      ({ count, rows } = await Leads.findAndCountAll({ where, offset, limit }));
    } else if (!fromDate && toDate) {
      const toTimestamp = new Date(`${toDate}T23:59:59.999Z`);
      where.createdAt = { [Op.lte]: toTimestamp };
      ({ count, rows } = await Leads.findAndCountAll({ where, offset, limit }));
    } else if (fromDate && toDate) {
      const fromTimestamp = new Date(`${fromDate}T00:00:00.000Z`);
      const toTimestamp = new Date(`${toDate}T23:59:59.999Z`);
      where.createdAt = { [Op.between]: [fromTimestamp, toTimestamp] };
      ({ count, rows } = await Leads.findAndCountAll({ where, offset, limit }));
    } else {
      ({ count, rows } = await Leads.findAndCountAll({ where, offset, limit }));
    }

    res.json({
      leads: rows,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      totalCount: count,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving Leads.",
    });
  }
};

exports.getAllLeadsByUserId = async (req, res) => {
  const { userId, pageNumber, pageSize, searchString, status } = req.body;
  const offset = pageNumber === 0 ? pageNumber : (pageNumber - 1) * pageSize;
  const limit = pageSize;

  const today = new Date();
  const where = {};
  where.userId = userId;
  where.leadStatus = status;
  where.createdAt = {
    [Op.between]: [today.setHours(0, 0, 0, 0), today.setHours(23, 59, 59, 999)],
  };
  if (searchString) {
    where[Op.or] = [
      { companyName: { [Op.like]: `%${searchString}%` } },
      { companyBusinessWebsite: { [Op.like]: `%${searchString}%` } },
      { title: { [Op.like]: `%${searchString}%` } },
      { firstName: { [Op.like]: `%${searchString}%` } },
      { lastName: { [Op.like]: `%${searchString}%` } },
      { email: { [Op.like]: `%${searchString}%` } },
      { telephone: { [Op.like]: `%${searchString}%` } },
      { recentJobPost: { [Op.like]: `%${searchString}%` } },
      { sourceOfLead: { [Op.like]: `%${searchString}%` } },
      { jobPostingLink: { [Op.like]: `%${searchString}%` } },
      { industry: { [Op.like]: `%${searchString}%` } },
      { companySize: { [Op.like]: `%${searchString}%` } },
      { companyLinkdin: { [Op.like]: `%${searchString}%` } },
      { personLinkedin: { [Op.like]: `%${searchString}%` } },
      { postedBy: { [Op.like]: `%${searchString}%` } },
      { country: { [Op.like]: `%${searchString}%` } },
      { sector: { [Op.like]: `%${searchString}%` } },
    ];
  }

  try {
    const { count, rows } = await Leads.findAndCountAll({
      where,
      offset,
      limit,
    });
    // return response with leads, total pages, and current page
    res.json({
      leads: rows,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      totalCount: count,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving Leads.",
    });
  }
};
// BD Leads without time constraints
exports.getAllBDLeadsByUserId = async (req, res) => {
  const { userId, pageNumber, pageSize, searchString } = req.body;
  const offset = pageNumber === 0 ? pageNumber : (pageNumber - 1) * pageSize;
  const limit = pageSize;

  const where = {};
  where.userId = userId;
  // where.createdAt = {
  //   [Op.between]: [today.setHours(0, 0, 0, 0), today.setHours(23, 59, 59, 999)],
  // };
  if (searchString) {
    where[Op.or] = [
      { companyName: { [Op.like]: `%${searchString}%` } },
      { companyBusinessWebsite: { [Op.like]: `%${searchString}%` } },
      { title: { [Op.like]: `%${searchString}%` } },
      { firstName: { [Op.like]: `%${searchString}%` } },
      { lastName: { [Op.like]: `%${searchString}%` } },
      { email: { [Op.like]: `%${searchString}%` } },
      { telephone: { [Op.like]: `%${searchString}%` } },
      { recentJobPost: { [Op.like]: `%${searchString}%` } },
      { sourceOfLead: { [Op.like]: `%${searchString}%` } },
      { jobPostingLink: { [Op.like]: `%${searchString}%` } },
      { industry: { [Op.like]: `%${searchString}%` } },
      { companySize: { [Op.like]: `%${searchString}%` } },
      { companyLinkdin: { [Op.like]: `%${searchString}%` } },
      { personLinkedin: { [Op.like]: `%${searchString}%` } },
      { postedBy: { [Op.like]: `%${searchString}%` } },
    ];
  }

  try {
    const { count, rows } = await Leads.findAndCountAll({
      where,
      offset,
      limit,
    });
    // return response with leads, total pages, and current page
    res.json({
      leads: rows,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      totalCount: count,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving Leads.",
    });
  }
};

exports.getLeadById = (req, res) => {
  const id = req.params.id;
  Leads.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Lead with id=" + id,
      });
    });
};

// find lead byb email
exports.getLeadByEmail = (req, res) => {
  const email = req.params.email;
  Leads.findOne({
    where: {
      email: email,
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Lead with email=" + email,
      });
    });
};

// Update all the required attributes of a Lead by the id in the request
exports.updateLead = async (req, res, next) => {
  try {
    const id = req.body.id; // assuming the lead ID is passed in the request body
    const lead = await Leads.findByPk(id); // Find the lead by its ID

    if (!lead) {
      res.status(404).send({
        message: "Lead not found",
      });
      return;
    }

    // update the lead with new data
    lead.companyName = req.body.companyName;
    lead.companyBusinessWebsite = String(req.body.companyBusinessWebsite);
    lead.title = req.body.title;
    lead.firstName = req.body.firstName;
    lead.lastName = req.body.lastName;
    lead.email = req.body.email;
    lead.telephone = req.body.telephone;
    lead.recentJobPost = String(req.body.recentJobPost);
    lead.sourceOfLead = String(req.body.sourceOfLead);
    lead.jobPostingLink = String(req.body.jobPostingLink);
    lead.industry = req.body.industry;
    lead.companySize = req.body.companySize;
    lead.companyLinkdin = String(req.body.companyLinkdin);
    lead.leadStatus = req.body.leadStatus;
    lead.personLinkedin = String(req.body.personLinkedin);
    lead.postedBy = req.body.postedBy;
    lead.country = req.body.country;
    lead.sector = req.body.sector;

    // Save the updated lead to the database
    await lead.save();

    res.status(200).send({
      message: "Lead updated successfully!",
      data: lead,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while updating the lead.",
    });
    next();
  }
};

// get perhour leads
exports.getPerHourLeads = (req, res) => {
  Leads.findAll({
    where: {
      createdAt: {
        [Op.gte]: new Date(new Date() - 60 * 60 * 1000),
      },
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Leads.",
      });
    });
};

exports.generateReport = async (req, res) => {
  try {
    let startDate = req.body.fromDate || null;
    let endDate = req.body.toDate || null;

    let query = `SELECT DATE(leads."createdAt"), leads."userId", users.username, COUNT(leads."email") as "dailyTotalLeads", COUNT(leads."companyName") as "dailyTotalCompanies", leads.country, leads.sector 
      FROM leads
      INNER JOIN users ON users.id = leads."userId" 
      WHERE 1 = 1`;

    if (startDate && endDate) {
      query += ` AND DATE(leads."createdAt") BETWEEN '${startDate}' AND '${endDate}'`;
    } else if (startDate) {
      query += ` AND DATE(leads."createdAt") = '${startDate}'`;
    } else if (endDate) {
      query += ` AND DATE(leads."createdAt") = '${endDate}'`;
    }

    query += ` GROUP BY DATE(leads."createdAt"), leads."userId", users.username, leads.sector, leads.country ORDER BY DATE(leads."createdAt") DESC`;

    const reportData = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ reportData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// Generate User Report
exports.generateUserReport = async (req, res) => {
  try {
    let startDate = req.body.fromDate || null;
    let endDate = req.body.toDate || null;
    let userId = req.body.userId || 0;

    if (userId === 0) {
      return res.status(500).json({ message: "User Not Found" });
    }
    let query = `SELECT leads."userId", users.username, COUNT(leads."email") as "totalLeads", COUNT(leads."companyName") as "totalCompanies" 
      FROM leads
      INNER JOIN users ON users.id = leads."userId" 
      WHERE 1 = 1`;

    if (startDate && endDate) {
      query += ` AND DATE(leads."createdAt") BETWEEN '${startDate}' AND '${endDate}'`;
    } else if (startDate) {
      query += ` AND DATE(leads."createdAt") = '${startDate}'`;
    } else if (endDate) {
      query += ` AND DATE(leads."createdAt") = '${endDate}'`;
    }

    query += ` AND leads."userId" = ${userId} GROUP BY leads."userId", users.username`;

    const reportData = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ reportData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// Helper function to check if a string is a valid date
function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) {
    return false;
  }
  const d = new Date(dateString + "T00:00:00.000Z");
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) {
    return false;
  }
  return d.toISOString().slice(0, 10) === dateString;
}
