import mongoose from 'mongoose';

export class MongoDBClient {
    static async connect() {
        try {
            const uri = process.env.MONGODB_URI || "mongodb://root:secret@localhost:27017";
            const dbName = process.env.MONGODB_DB_NAME || "codigo-a-voluntad";
            const connectionString = uri.includes(dbName)
                ? uri
                : `${uri}/${dbName}?authSource=admin`;

            const conn = await mongoose.connect(connectionString);
            console.log(`MongoDB is connected: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
            if (process.env.NODE_ENV !== "test") {
                process.exit(1);
            }
        }
    }

    static async disconnect() {
        if (mongoose.connection && mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("MongoDB disconnected cleanly");
        }
    }
}