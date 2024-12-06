"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_devices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      device_name: {
        type: Sequelize.STRING,
      },
      device_token: {
        type: Sequelize.STRING,
        index: true,
      },
      platform: {
        type: Sequelize.STRING,
      },
      os_version: {
        type: Sequelize.STRING,
      },
      app_version: {
        type: Sequelize.STRING,
      },
      app_build: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_devices");
  },
};
