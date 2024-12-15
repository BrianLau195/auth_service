import {
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  ForeignKey,
} from "sequelize";
import { sequelize } from ".";
import User from "./user";

class UserDevice extends Model<
  InferAttributes<UserDevice>,
  InferCreationAttributes<UserDevice>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare deviceName: CreationOptional<string>;
  declare deviceToken: string;
  declare platform: CreationOptional<string>;
  declare osVersion: CreationOptional<string>;
  declare appVersion: CreationOptional<string>;
  declare appBuild: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserDevice.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    deviceName: { type: DataTypes.STRING },
    deviceToken: { type: DataTypes.STRING, allowNull: false, unique: true },
    platform: { type: DataTypes.STRING },
    osVersion: { type: DataTypes.STRING },
    appVersion: { type: DataTypes.STRING },
    appBuild: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "user_devices" },
);

export default UserDevice;
