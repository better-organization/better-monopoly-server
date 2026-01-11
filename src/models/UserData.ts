import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import crypto from 'crypto';

export interface IUserData {
  uniqueID: string; // 10-digit unique identifier (primary lookup)
  userId: string; // User-defined unique identifier
  username: string; // Display name
  experiencePoints?: number; // Game experience points
  level?: number; // Game level
  avatarUrl?: string; // Profile avatar URL
  createdAt: Date;
  updatedAt: Date;
  toPublicObject(): {
    uniqueID: string;
    userId: string;
    username: string;
    experiencePoints?: number;
    level?: number;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface IUserDataModel extends Model<IUserData> {
  findByUniqueID(uniqueID: string): Promise<HydratedDocument<IUserData> | null>;
  findByUserId(userId: string): Promise<HydratedDocument<IUserData> | null>;
  generateUniqueID(): Promise<string>;
  createUserData(
    uniqueID: string,
    username: string,
    userId: string
  ): Promise<HydratedDocument<IUserData>>;
}

const UserDataSchema = new Schema<IUserData, IUserDataModel>(
  {
    uniqueID: {
      type: String,
      required: [true, 'UniqueID is required'],
      unique: true,
      index: true,
      immutable: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Z0-9]{10}$/.test(v);
        },
        message: 'UniqueID must be exactly 10 alphanumeric characters',
      },
    },
    userId: {
      type: String,
      required: [true, 'UserId is required'],
      unique: true,
      index: true,
      trim: true,
      minlength: [3, 'UserId must be at least 3 characters'],
      maxlength: [50, 'UserId cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    experiencePoints: {
      type: Number,
      default: 0,
      min: [0, 'Experience points cannot be negative'],
    },
    level: {
      type: Number,
      default: 1,
      min: [1, 'Level must be at least 1'],
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_data',
  }
);

UserDataSchema.static('generateUniqueID', async function (): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uniqueID: string;
  let exists = true;

  while (exists) {
    const bytes = crypto.randomBytes(10);
    uniqueID = Array.from(bytes)
      .map(byte => chars[byte % chars.length])
      .join('');

    exists = (await this.findOne({ uniqueID })) !== null;
  }

  return uniqueID!;
});

UserDataSchema.static('findByUniqueID', async function (
  uniqueID: string
): Promise<HydratedDocument<IUserData> | null> {
  return this.findOne({ uniqueID });
});

UserDataSchema.static('findByUserId', async function (
  userId: string
): Promise<HydratedDocument<IUserData> | null> {
  return this.findOne({ userId });
});

UserDataSchema.static('createUserData', async function (
  uniqueID: string,
  username: string,
  userId: string
): Promise<HydratedDocument<IUserData>> {
  const userData = new this({
    uniqueID,
    userId,
    username,
  });
  return userData.save();
});

UserDataSchema.method('toPublicObject', function () {
  return {
    uniqueID: this.uniqueID,
    userId: this.userId,
    username: this.username,
    experiencePoints: this.experiencePoints,
    level: this.level,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

export const UserData = mongoose.model<IUserData, IUserDataModel>(
  'UserData',
  UserDataSchema
);
