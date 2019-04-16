import mongoose from 'mongoose';
const {Schema} = mongoose;

const citySchema = new Schema({
    name: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    image: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    coordinates: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    stores: [{
        type: Schema.Types.ObjectId,
        ref: 'Store'
    }]
});

const City = mongoose.model('City', citySchema);
export default City;