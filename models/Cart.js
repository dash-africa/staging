import mongoose from 'mongoose';
const { Schema } = mongoose;

const cartSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Item'
        },
        name: {
            type: String,
            required: true,
            help: 'This field is required',
        },
        price: {
            type: String,
            required: true,
            help: 'This field is required'
        },
        addOns: [{
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Item'
            },
            name: {
                type: String,
                required: true,
                help: 'This field is required',
            },
            price: {
                type: String,
                required: true,
                help: 'This field is required'
            },
        }]
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;