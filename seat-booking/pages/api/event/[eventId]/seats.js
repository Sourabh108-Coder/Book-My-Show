import connectDb from "@/middleware/database";
import Event from "@/models/Event";
import redis from "@/lib/redis";
import BookedSeat from "@/models/BookedSeat";

const handler = async(req,res) =>
{
    const { eventId } = req.query;

    try
    {
        const event = await Event.findById(eventId);

        if(!event)
        {
            return res.status(404).json(
                {
                    success:false,
                    message:"Event Not Found",
                }
            )
        }

        const seats = await Promise.all(
            event.seatLayout.map(async(seatId)=>{
                const holdBy = await redis.get(`hold:${eventId}:${seatId}`);
                const ttl = holdBy ? await redis.ttl(`hold:${eventId}:${seatId}`) : null;
                const isBooked = await BookedSeat.findOne({ eventId, seatId });

                if(isBooked)
                {
                    return{
                        seatId,
                        status:"BOOKED",
                    };
                }

                if(holdBy)
                {
                    return{
                        seatId,
                        status: "HELD",
                        heldBy: holdBy,
                        holdExpiresAt: Date.now() + ttl * 1000,

                    };
                }

                return { seatId, status: "AVAILABLE" };
            })
        );

        res.json(
            {
                eventId,
                seats,
                serverTime:Date.now(),
            }
        );
    }

    catch(error)
    {
        res.status(500).json(
            {
                success:false,
                message:error.message,
            }
        )
    }
}


export default connectDb(handler);