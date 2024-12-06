import {
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  ForeignKey,
  BelongsToGetAssociationMixin,
} from "sequelize";
import { sequelize } from ".";
import User from "./user";
import { createHash } from "crypto";
import verifyToken from "../utils/verifyToken";
import UserDevice from "./userDevice";

class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare userDeviceId: ForeignKey<UserDevice["id"]>;
  declare token: string;
  declare tokenHash: CreationOptional<string>;
  declare expiresAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getUser: BelongsToGetAssociationMixin<User>;

  hashToken(token: string) {
    if (this.changed("token")) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded.exp === "number") {
        this.expiresAt = new Date(decoded.exp * 1000);
        this.tokenHash = createHash("md5").update(token).digest("hex");
      }
    }
  }

  validateToken(token: string) {
    return this.tokenHash === createHash("md5").update(token).digest("hex");
  }

  static findByToken(token: string) {
    return RefreshToken.findOne({
      where: { tokenHash: createHash("md5").update(token).digest("hex") },
    });
  }
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    userDeviceId: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.VIRTUAL, allowNull: false },
    tokenHash: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: "refresh_tokens",
    hooks: {
      beforeValidate: (refreshToken) =>
        refreshToken.hashToken(refreshToken.token),
    },
  },
);

export default RefreshToken;
