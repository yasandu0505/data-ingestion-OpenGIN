import mongoose, { Schema, Model, Document } from 'mongoose';

// Define the interface for kind pairs
export interface IKindPair {
  majorKind: string;
  minorKind: string;
}

// Define the interface for the endpoint document
export interface IEndpoint extends Document {
  readApiUrl: string;
  updateApiUrl: string;
  kindPairs: IKindPair[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema
const EndpointSchema: Schema = new Schema(
  {
    readApiUrl: {
      type: String,
      required: [true, 'readApiUrl is required'],
      trim: true,
    },
    updateApiUrl: {
      type: String,
      required: [true, 'updateApiUrl is required'],
      trim: true,
    },
    kindPairs: {
      type: [
        {
          majorKind: {
            type: String,
            required: true,
            trim: true,
          },
          minorKind: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create and export the model
// Delete the model if it exists to ensure schema updates are applied
if (mongoose.models.Endpoint) {
  delete mongoose.models.Endpoint;
}

const Endpoint: Model<IEndpoint> = mongoose.model<IEndpoint>('Endpoint', EndpointSchema);

// Helper function to ensure Mongoose is connected
// This uses the connection from mongodb.ts
export async function ensureMongooseConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  // Import and use the connection from mongodb.ts
  const { connectMongoose } = await import('./mongodb');
  await connectMongoose();
}

export default Endpoint;
