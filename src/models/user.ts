import {
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  HasManyHasAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyGetAssociationsMixin,
} from "sequelize";
import { sequelize } from ".";
import { hashPassword, verifyPassword, signToken } from "../utils";
import RefreshToken from "./refreshToken";
import UserDevice from "./userDevice";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare firstName: CreationOptional<string>;
  declare lastName: CreationOptional<string>;
  declare password: string;
  declare hashedPassword: CreationOptional<string>;
  declare uuid: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

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
    "userId"
  >;

  declare getUserDevices: HasManyGetAssociationsMixin<UserDevice>;
  declare addUserDevice: HasManyAddAssociationMixin<UserDevice, number>;
  declare addUserDevices: HasManyAddAssociationsMixin<UserDevice, number>;
  declare setUserDevices: HasManySetAssociationsMixin<UserDevice, number>;
  declare removeUserDevice: HasManyRemoveAssociationMixin<UserDevice, number>;
  declare removeUserDevices: HasManyRemoveAssociationsMixin<UserDevice, number>;
  declare hasUserDevice: HasManyHasAssociationMixin<UserDevice, number>;
  declare hasUserDevices: HasManyHasAssociationsMixin<UserDevice, number>;
  declare countUserDevices: HasManyCountAssociationsMixin;
  declare createUserDevice: HasManyCreateAssociationMixin<UserDevice, "userId">;

  async verifyPassword(password: string): Promise<boolean> {
    return await verifyPassword(password, this.hashedPassword);
  }

  async generateToken() {
    return await signToken({ id: this.id });
  }

  async generateAccessToken() {
    return await this.generateToken();
  }

  async generateRefreshToken(userDevice: UserDevice) {
    const token = await this.generateToken();
    await RefreshToken.create({
      userId: this.id,
      userDeviceId: userDevice.id,
      token: token,
    });
    return token;
  }

  async updateHashedPassword() {
    if (this.changed("password")) {
      this.hashedPassword = await hashPassword(this.password);
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.VIRTUAL, allowNull: false },
    hashedPassword: { type: DataTypes.STRING, allowNull: false },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: "users",
    hooks: {
      beforeValidate: (user) => user.updateHashedPassword(),
    },
  },
);

export default User;
