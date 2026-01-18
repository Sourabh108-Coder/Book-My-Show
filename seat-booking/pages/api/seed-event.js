import connectDb from "@/middleware/database";
import Event from "@/models/Event";


const handler = async(req,res)=>
{
    const seats = Array.from({length:50},(_,i)=>
    {
        const row = String.fromCharCode(65 + Math.floor(i / 10));
        const col = (i % 10) + 1;
        return `${row}${col}`;
    });

    try
    {
        const event = await Event.findByIdAndUpdate(process.env.EVENT_ID,{ _id: process.env.EVENT_ID, name: "Sample Event", seatLayout: seats },{ upsert: true, new: true });

        res.status(200).json(
            {
                message: "Event seeded",
                event,
            }
        )
    }

    catch(error)
    {

        console.log("I am Sample Event Error",error.message);
        res.status(500).json(
            {
                success:false,
                message:error.message,
            }
        )
    }
};

export default connectDb(handler);