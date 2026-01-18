const mongoose = require('mongoose');

const EventSchema=new mongoose.Schema(
    {
        _id:{
            type:String,
            required:true,
        },
        
        name:{
            type:String,
            required:true,
        },

        seatLayout:[String],

    },{timestamps:true}
)


const Event=mongoose.models.Event||mongoose.model("Event",EventSchema);
module.exports=Event;