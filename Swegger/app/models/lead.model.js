module.exports = (sequelize, Sequelize) => {
  const Lead = sequelize.define("lead", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    companyName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    companyBusinessWebsite: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: {
        args: true,
        msg: "Email address already in use!",
      },
    },
    telephone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    recentJobPost: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sourceOfLead: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    jobPostingLink: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    industry: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    companySize: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    companyLinkdin: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    personLinkedin: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    postedBy: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    leadStatus: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "new",
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: null,
    },
    sector: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: null,
    },
    emailSendingDate: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
  });
  return Lead;
};
