import mongoose, { Schema, Model, Document } from 'mongoose';

// Define the interface for the endpoint document
export interface IEndpoint extends Document {
  readApiUrl: string;
  updateApiUrl: string;
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create and export the model
// Use existing connection if available, otherwise mongoose will create a new one
const Endpoint: Model<IEndpoint> =
  mongoose.models.Endpoint || mongoose.model<IEndpoint>('Endpoint', EndpointSchema);

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
