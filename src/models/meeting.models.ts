import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../data/database";

interface MeetingAttributes {
  id: number;
  title: string;
  data: Date;
  inicialHora: string;
  finalHora: string;
  local: string;
  qparticipants: number;
  descricao: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MeetingCreationAttributes extends Optional<MeetingAttributes, "id"> {}

class Meeting
  extends Model<MeetingAttributes, MeetingCreationAttributes>
  implements MeetingAttributes
{
  public id!: number;
  public title!: string;
  public data!: Date;
  public inicialHora!: string;
  public finalHora!: string;
  public local!: string;
  public qparticipants!: number;
  public descricao!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Meeting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    inicialHora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    finalHora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    local: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    qparticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "meetings",
    timestamps: true,
    underscored: false,
  }
);

export default Meeting;
