import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';

export interface IAuthData {
  uniqueID: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IAuthDataModel extends Model<IAuthData> {
  findByUniqueID(uniqueID: string): Promise<HydratedDocument<IAuthData> | null>;
  findByUserId(userId: string): Promise<HydratedDocument<IAuthData> | null>;
  userIdExists(userId: string): Promise<boolean>;
  createAuthData(
    uniqueID: string,
    userId: string,
    passwordHash: string
  ): Promise<HydratedDocument<IAuthData>>;
}

const AuthDataSchema = new Schema<IAuthData, IAuthDataModel>(
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
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: true,
    },
  },
  {
    timestamps: true,
    collection: 'auth_data',
  }
);

AuthDataSchema.static('findByUniqueID', async function (
  uniqueID: string
): Promise<HydratedDocument<IAuthData> | null> {
  return this.findOne({ uniqueID });
});

AuthDataSchema.static('findByUserId', async function (
  userId: string
): Promise<HydratedDocument<IAuthData> | null> {
  return this.findOne({ userId });
});

AuthDataSchema.static('userIdExists', async function (
  userId: string
): Promise<boolean> {
  const authData = await this.findOne({ userId }).select('_id');
  return authData !== null;
});

AuthDataSchema.static('createAuthData', async function (
  uniqueID: string,
  userId: string,
  passwordHash: string
): Promise<HydratedDocument<IAuthData>> {
  const authData = new this({
    uniqueID,
    userId,
    passwordHash,
  });
  return authData.save();
});

export const AuthData = mongoose.model<IAuthData, IAuthDataModel>(
  'AuthData',
  AuthDataSchema
);
