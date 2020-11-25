import axios from 'axios';

const paystackUrl = 'https://api.paystack.co/transaction';

const verifyPayment = async (paymentReference) => {
    const response = await axios.get(`${paystackUrl}/verify/${paymentReference}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });

    console.log(response);
    return response.data;
};

export default { verifyPayment };