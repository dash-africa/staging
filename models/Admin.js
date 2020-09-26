import mongoose from 'mongoose';
const { Schema } = mongoose;

const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    password: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;