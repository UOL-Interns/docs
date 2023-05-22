module.exports = (sequelize, Sequelize) => {
  const Settings = sequelize.define("settings", {
    // start Time and end time settings for the application
    startTime: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "09:00",
    },
    endTime: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "22:00",
    },
  });
  return Settings;
};

