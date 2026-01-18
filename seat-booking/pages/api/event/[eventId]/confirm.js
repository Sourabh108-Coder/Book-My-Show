import connectDb from "@/middleware/database";
import redis from "@/lib/redis";
import BookedSeat from "@/models/BookedSeat";
import Booking from "@/models/Booking";
import {v4 as uuidv4} from "uuid"

const handler = async(req,res)=>
{
    if(req.method != 'POST')
    {
        return res.status(405).json(
            {
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
                message:"x-user-id header required",
            }
        )
    }

    if(!seatIds || !Array.isArray(seatIds) || seatIds.length === 0)
    {
        return res.status(400).json(
            {
                success:false,
                message: "seatIds required"
            }
        )
    }

    try
    {
        const failed = [];
        const toBook = [];


        for(const seatId of seatIds)
        {
             const heldBy = await redis.get(`hold:${eventId}:${seatId}`);

             if(heldBy !== userId)
             {
                failed.push({ seatId, reason: "NOT_HELD_BY_USER" });
             }
             else
             {
                toBook.push(seatId);
             }
        }

        if(toBook.length === 0)
        {
            return res.status(400).json(
                {
                    message: "No seats available to confirm",
                    failed,
                }
            )
        }

        const bookingId = uuidv4();
        const bookedSeats = [];


        for (const seatId of toBook)
        {
            try
            {
                const booked = new BookedSeat(
                    {
                        eventId,
                        seatId,
                        bookingId,
                        userId,
                    }
                );

                await booked.save();
                bookedSeats.push(seatId);

                await redis.del(`hold:${eventId}:${seatId}`);
            }

            catch(error)
            {
                failed.push({ seatId, reason: "ALREADY_BOOKED" });
            }
        }

        const booking = new Booking(
            {
                bookingId,
                eventId,
                userId,
                seatIds: bookedSeats,
            }
        );

        await booking.save();

        res.json(
            {
                bookingId,
                eventId,
                seatIds: bookedSeats,
                failed,
            }
        );

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