const mongoose = require('mongoose');


const BookingSchema = new mongoose.Schema(
    {

        bookingId:{
            type:String,
            required: true,
            unique: true ,

        },

        eventId:{
            type:String,
            required:true,
        },

        userId:{
            type:String,
            required:true,
        },

        seatIds:[String],

    },{timestamps:true}
);

const Booking=mongoose.models.Booking||mongoose.model("Booking",BookingSchema);
module.exports=Booking;