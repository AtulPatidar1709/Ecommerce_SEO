import mongoose from 'mongoose';
import redis from 'redis';

let redisClient;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    redisClient = redis.createClient({
      socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
    console.log('Redis connected');

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default { connectDB, redisClient };
