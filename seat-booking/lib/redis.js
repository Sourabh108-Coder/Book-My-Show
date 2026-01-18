import { createClient } from "redis";

const redis = createClient({url:process.env.REDIS_URL});

async function connectRedis() {
    
    if(!redis.isOpen)
    {
        await redis.connect();
    }

    console.log("Redis connected");
}

connectRedis();

export default redis;