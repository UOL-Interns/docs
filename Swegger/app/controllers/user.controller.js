const db = require("../models");
const crypto = require("crypto");
const User = db.user;
const sendVerificationEmail =
  require("../middlewares/auth.middleware").sendVerificationEmail;
// const sendEmail = require("../utils/sendEmail");
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendPasswordResetEmail } = require("../middlewares/auth.middleware");

// Create and Save a new User
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.username) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  // check if user already exists

  const userExists = await User.findOne({
    where: {
      username: req.body.username,
    },
    where: {
      email: req.body.email,
    },
  });
  if (userExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  // check if role admin exists, if exists then do not allow to create another admin
  if (req.body.role === "admin") {
    const adminExists = await User.findOne({
      where: {
        role: "admin",
      },
    });
    if (adminExists) {
      return res.status(400).json({
        message: "No more then one admin is allowed",
      });
    }
  }

  // hashed password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Generate verification token
  const verificationToken = crypto.randomBytes(16).toString("hex");

  // Create a User
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
    status: req.body.status,
    isvarified: req.body.isvarified,
    verificationtoken: verificationToken,
  })
    .then((data) => {
      try {
        sendVerificationEmail(
          data.email,
          data.verificationtoken,
          data.username
        );
      } catch (error) {
        console.log("Email sending error", error);
      }
      res.status(200).send({
        message: "User was created successfully.",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
};

// Update user Data
exports.update = async (req, res) => {
  const id = req.params.id;
  User.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Retrieve all Users from the database.

exports.getAllUsers = (req, res) => {
  const { pageNumber, pageSize, searchString, userStatus } = req.body;
  const offset = pageNumber * pageSize;
  const limit = parseInt(pageSize);

  const where = {};
  if (searchString) {
    where[Op.or] = [
      { username: { [Op.like]: `%${searchString}%` } },
      { email: { [Op.like]: `%${searchString}%` } },
      { role: { [Op.like]: `%${searchString}%` } },
    ];
  }
  if (userStatus === "all") {
    where.isApprovedByAdmin = {
      [Op.or]: [true, false],
    };
  } else if (userStatus === "approved") {
    where.isApprovedByAdmin = true;
  } else if (userStatus === "pending") {
    where.isApprovedByAdmin = false;
  }
  User.findAndCountAll({
    where,
    offset: offset,
    limit: limit,
  })
    .then((data) => {
      res.send({
        // change approvedByAdmin from boolean to string
        users: data.rows.map((user) => {
          return {
            ...user.dataValues,
            isvarified: user.isvarified ? "varified" : "not varified",
            isApprovedByAdmin: user.isApprovedByAdmin ? "approved" : "pending",
          };
        }),
        totalCount: data.count,
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// varify user email address by token and update user status to active and isvarified to true in the database.
exports.varifyEmail = async (req, res) => {
  // check if verification token is valid and exists in the database

  const user = await User.findOne({
    where: {
      verificationtoken: req.body.verificationtoken,
    },
  });
  if (user.isvarified && user.status === "active") {
    return res.status(400).json({
      message: "Email already varified",
    });
  }

  // update user status to active and isvarified to true
  try {
    User.update(
      {
        isvarified: true,
      },
      {
        where: {
          verificationtoken: req.body.verificationtoken,
        },
      }
    );
    res.status(200).send({
      message: "Email varified successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while varifying email.",
    });
  }
};

// Get verification token for user by email or username
exports.getVerificationToken = async (req, res) => {
  const email = req.params.email;

  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  res.send(user.verificationtoken);
};

// login user
exports.login = async (req, res) => {
  const { username, password, role } = req.body;
  const user = await User.findOne({
    where: {
      username: username,
      role: role,
    },
  });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({
      message: "Invalid password",
    });
  }

  // check if user is varified
  if (!user.isvarified) {
    return res.status(401).json({
      message: "Please varify your email address",
    });
  }

  // check if user is active
  if (user.status !== "active") {
    return res.status(403).json({
      message: "Your account is not active",
    });
  }

  // check if user is approved by admin
  if (!user.isApprovedByAdmin) {
    return res.status(403).json({
      message: "Your account is not approved by admin",
    });
  }
  const secret = "we-be_software-house_in-2023";
  // create and assign a token
  const token = jwt.sign({ _id: user.id }, secret);
  res.header("auth-token", token).send({
    token: token,
    id:user.id,
    userName: user.username,
    email:user.email,
    role:user.role,
    status:user.status,
    approved:user.isApprovedByAdmin,
    message: "Login successfully",
  });
};

exports.approveAccount = async (req, res) => {
  const username = req.body.username;

  const user = await User.findOne({
    where: {
      username: username,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  // check if user is already approved
  if (user.isApprovedByAdmin) {
    return res.status(400).json({
      message: "User already approved",
    });
  }

  await user.update({
    status: "active",
    isApprovedByAdmin: true,
  });
  res.send("Account approved");
};

exports.deactivateAccount = async (req, res) => {
  const username = req.body.username;

  const user = await User.findOne({
    where: {
      username: username,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  // check if user is already deactivated
  if (user.status === "deactivated") {
    return res.status(400).json({
      message: "User already deactivated",
    });
  }

  await user.update({
    status: "inactive",
    isApprovedByAdmin: false,
  });
  res.send("Account deactivated");
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};

// delete a user with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

// send reset password link to user email with 30 minutes expiry token
exports.sendResetPasswordLink = async (req, res) => {
  const {email} = req.body
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  // generate random token
  const randomToken = Math.random().toString(36).slice(-8);
  // hash token
  const salt = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(randomToken, salt);

  // update user token
  try {
    User.update(
      {
        resetpasswordtoken: hashedToken,
        resetpasswordexpires: Date.now() + 30 * 60 * 1000,
      },
      {
        where: {
          email: email,
        },
      }
    );
    sendPasswordResetEmail(email, randomToken);
    res.status(200).send({
      message: "Reset password link sent to your email",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error sending reset password link",
    });
  }
};

// reset password by email
exports.resetPassword = async (req, res) => {
  const {newPassword,email} = req.body;
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // update user password
  try {
    User.update(
      {
        password: hashedPassword,
      },
      {
        where: {
          email: email,
        },
      }
    );
    res.status(200).send({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while reseting password.",
    });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.body.userId;
  if (userId === 0 || typeof userId === "string") {
    return res.status(400).send({
      message:
        "User Id is required. Check Data type or it must be greater than 0",
    });
  }
  // check if user exists
  const user = await User.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return res.status(404).send({
      message: "User Not Found",
    });
  }
  console.log(user);
  return res.status(200).json({
    userId: user.id,
    userName: user.username,
    email: user.email,
    role: user.role,
  });
};
