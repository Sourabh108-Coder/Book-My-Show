import connectDb from "@/middleware/database";
import Booking from "@/models/Booking";

const handler = async(req,res)=>
{
    if(req.method !== "GET")
    {
        return res.status(405).json(
            {
                message:"Method Not Allowed",
            }
        )
    }

     const userId = req.headers["x-user-id"];

     if(!userId)
     {
        return res.status(400).json(
            {
                success:false,
                message: "x-user-id header required",
            }
        )
     }

     try
     {
        const bookings = await Booking.find({userId}).sort({ createdAt: -1 }).lean();

        res.json(
            {
                success:false,
                bookings,
            }
        );
     }
     catch(error)
     {
        console.error(error);

        res.status(500).json(
            {
                success: false,
                message: error.message,
            }
        )
     }
}


export default connectDb(handler);
