import mongoose from 'mongoose';
const {Schema} = mongoose;

const itemSchema = new Schema({
    price: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    image: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    name: {
        type: String,
        required: 'This field is required'
    }
});

const Item = mongoose.model('Item', itemSchema);
export default Item;