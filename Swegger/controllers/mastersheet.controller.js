const db = require("../models");
const MasterSheet = db.mastersheet;
const Leads = db.lead;
const Op = db.Sequelize.Op;
const { QueryTypes } = require("sequelize");
const Sequelize = require("sequelize");
const https = require("https");
const api_key = "d38bb999ffc24e1a9a793f26de4a09e7";

exports.addLeadToMasterSheet = async (req, res, next) => {
  const {
    firstName,
    lastName,
    jobTitle,
    email,
    companyName,
    unSubEmails,
    country,
    sector,
  } = req.body;
  try {
    const existingLead = await MasterSheet.findOne({
      where: { email: req.body.email },
    });
    if (existingLead) {
      return res
        .status(400)
        .send({
          message:
            "Cannot add this lead to master sheet because it already exists.",
        });
    }

    // get the maximum ID from the MasterSheet table
    const maxIdRecord = await MasterSheet.findOne({
      attributes: [[Sequelize.fn("max", Sequelize.col("id")), "max_id"]],
    });
    const maxId = maxIdRecord.get("max_id") || 0;
    const id = maxId + 1;
    const mastersheetLead = await MasterSheet.create({
      id,
      firstName,
      lastName,
      jobTitle,
      email,
      companyName,
      unSubEmails,
      country,
      sector,
    });
    res
      .status(200)
      .send({
        message: "Lead added to MasterSheet successfully!",
        data: mastersheetLead,
      });
  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      res
        .status(500)
        .send({
          message:
            error.message ||
            "Some error occurred while adding lead to MasterSheet.",
        });
    }
    next();
  }
};

// get Whole mastersheet data
exports.getWholeMasterSheetDataWithPagination = async (req, res) => {
  const { country, sector, pageNumber, pageSize, searchString } = req.body;
  const offset = pageNumber === 0 ? pageNumber : (pageNumber - 1) * pageSize;
  const limit = pageSize;

  let fromDate = req.body.fromDate || null;
  let toDate = req.body.toDate || null;
  if (!fromDate && !toDate) {
    return res
      .status(400)
      .json({ message: "Either fromDate or toDate must be provided" });
  }
  // if country and sector is null
  if (!country || !sector) {
    return res.status(400).json({
      message: "Must provide country and sector",
    });
  }
  // where condition
  const where = {};
  if (searchString) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${searchString}%` } },
      { lastName: { [Op.like]: `%${searchString}%` } },
      { jobTitle: { [Op.like]: `%${searchString}%` } },
      { email: { [Op.like]: `%${searchString}%` } },
      { companyName: { [Op.like]: `%${searchString}%` } },
      { unSubEmails: { [Op.like]: `%${searchString}%` } },
      { country: { [Op.like]: `%${searchString}%` } },
      { sector: { [Op.like]: `%${searchString}%` } },
    ];
  }
  where.country = country;
  where.sector = sector;
  where.createdAt = {
    [Op.between]: [new Date(fromDate), new Date(toDate)],
  };

  try {
    const result = await MasterSheet.findAndCountAll();
    const grandTotal = result.count;
    const { count, rows } = await MasterSheet.findAndCountAll({
      where,
      offset,
      limit,
    });
    // return response with MasterSheet, total pages, and current page
    res.json({
      MasterSheet: rows,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      totalCount: count,
      grandTotal: grandTotal,
    });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving MasterSheet.",
    });
  }
};

exports.getWholeMasterSheetDataWithoutPagination = async (req, res) => {
  try {
    let fromDate = req.body.fromDate || null;
    let toDate = req.body.toDate || null;
    let query = `SELECT * FROM mastersheets WHERE 1=1 `;
    if (fromDate && toDate) {
      query += ` AND DATE(mastersheets."createdAt") BETWEEN '${fromDate}' AND '${toDate}'`;
    } else if (fromDate) {
      query += ` AND DATE(mastersheets."createdAt") = '${fromDate}'`;
    } else if (toDate) {
      query += ` AND DATE(mastersheets."createdAt") = '${toDate}'`;
    }
    query += ` ORDER BY DATE(mastersheets."createdAt") DESC`;

    const mastersheetExportData = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ mastersheetExportData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate Mastersheet" });
  }
};

exports.sendEmailAncCheckBounce = (req, res) => {
  const { email } = req.body;
  const options = {
    hostname: "api.zerobounce.net",
    port: 443,
    path: `/v2/validate?api_key=${api_key}&email=${email}`,
    method: "GET",
    secureProtocol: "TLSv1_2_method",
  };

  const request = https.request(options, (response) => {
    let body = "";
    response.on("data", (d) => (body += d));
    response.on("end", () => {
      const result = JSON.parse(body);
      res.json(result);
    });
  });

  request.on("error", (err) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  request.end();
};

// Check for duplicate email
exports.checkDuplicateEmail = async (req, res, next) => {
  // check if email exists in database or not.
  const isEmailExistsInMasterSheet = await MasterSheet.findOne({
    where: {
      [Op.or]: [{ email: req.body.email }, { unSubEmails: req.body.email }],
    },
  });
  if (isEmailExistsInMasterSheet) {
    return res.status(400).send({
      message: "Email already exists!",
    });
  }
  const isEmailExistsInLeads = await Leads.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (isEmailExistsInLeads) {
    return res.status(400).send({
      message: "Email already exists!",
    });
  } else {
    res.status(200).send({
      message: "This email is not duplicate.",
    });
  }
  next();
};
