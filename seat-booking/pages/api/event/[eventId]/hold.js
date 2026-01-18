import connectDb from "@/middleware/database";
import redis from "@/lib/redis";
import BookedSeat from "@/models/BookedSeat";

const HOLD_DURATION = 120;

const handler = async(req,res) =>
{
    if(req.method != "POST")
    {
        return res.status(405).json(
            {
                success:false,
                message:"Method Not Allowed",
            }
        )
    }

    const { eventId } = req.query;
    const userId = req.headers["x-user-id"];
    const { seatIds } = req.body;

    if(!userId)
    {
        return res.status(400).json(
            {
                success:false,
                message:"x-user-id header is required",
            }
        )
    }

    if(!seatIds || !Array.isArray(seatIds) || seatIds.length === 0)
    {
        return res.status(400).json(
            {
                success:false,
                message:"seatIds are required",
            }
        )
    }

    try
    {
          const held = [];
          const failed = [];

          for(const seatId of seatIds)
          {
            const booked = await BookedSeat.findOne({ eventId, seatId });

            if(booked)
            {
                failed.push({ seatId, reason: "ALREADY_BOOKED" });
                continue;
            }

            const result = await redis.set(`hold:${eventId}:${seatId}`, userId,{ NX: true, EX: HOLD_DURATION });

            if(result == null)
            {
                 failed.push({ seatId, reason: "ALREADY_HELD" });
            }

            else
            {
                held.push(seatId);
            }
          }

           res.json(
            { 
                held, 
                failed 
            });
    }

    catch(error)
    {
        console.error(error);

        res.status(500).json(
            {
                message:error.message,
            }
        )
    }
}

export default connectDb(handler);