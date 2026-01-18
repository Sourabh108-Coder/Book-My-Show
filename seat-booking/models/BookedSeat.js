const mongoose = require('mongoose');


const BookedSeatSchema = new mongoose.Schema(
    {
        eventId:{
            type:String,
            required:true,
        },

        seatId:{
            type:String,
            required:true,
        },

        bookingId:{
            type:String,
            required:true,
        },

        userId:{
            type:String,
            required:true,
        },

    },{timestamps:true}
);

BookedSeatSchema.index({ eventId: 1, seatId: 1 }, { unique: true });


const BookedSeat=mongoose.models.BookedSeat||mongoose.model("BookedSeat",BookedSeatSchema);
module.exports=BookedSeat;