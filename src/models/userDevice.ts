import {
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  ForeignKey,
  HasManyGetAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  BelongsToGetAssociationMixin,
} from "sequelize";
import { sequelize } from ".";
import User from "./user";
import RefreshToken from "./refreshToken";

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

  declare getUser: BelongsToGetAssociationMixin<User>;

  declare getRefreshTokens: HasManyGetAssociationsMixin<RefreshToken>; // Note the null assertions!
  declare addRefreshToken: HasManyAddAssociationMixin<RefreshToken, number>;
  declare addRefreshTokens: HasManyAddAssociationsMixin<RefreshToken, number>;
  declare setRefreshTokens: HasManySetAssociationsMixin<RefreshToken, number>;
  declare removeRefreshToken: HasManyRemoveAssociationMixin<
    RefreshToken,
    number
  >;
  declare removeRefreshTokens: HasManyRemoveAssociationsMixin<
    RefreshToken,
    number
  >;
  declare hasRefreshToken: HasManyHasAssociationMixin<RefreshToken, number>;
  declare hasRefreshTokens: HasManyHasAssociationsMixin<RefreshToken, number>;
  declare countRefreshTokens: HasManyCountAssociationsMixin;
  declare createRefreshToken: HasManyCreateAssociationMixin<
    RefreshToken,
    "userDeviceId"
  >;
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
