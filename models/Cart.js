import mongoose from 'mongoose';
const {Schema} = mongoose;

const cartSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }]
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;