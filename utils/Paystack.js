import axios from 'axios';

const paystackUrl = 'https://api.paystack.co';

const paystackHeader = {
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    }
};

const verifyPayment = async (paymentReference) => {
    const response = await axios.get(`${paystackUrl}/transaction/verify/${paymentReference}`, paystackHeader);

    return response.data;
};

const chargeCard = async (authorization_code, email, amount) => {
    const data = {
        authorization_code,
        email,
        amount: amount * 100
    };
    const response = await axios.post(`${paystackUrl}/transaction/charge_authorization`, data, paystackHeader);

    return response.data;
};

const addPaystackChargeToamount = (amount) => {
    let newAmount = 0;
    const charge = amount * 0.015;

    newAmount = amount + charge;

    if (amount > 2500) {
        newAmount += 100;
    }

    return newAmount;
};

const verifyAccountNumber = async (accountNumber, bankCode) => {
    const response = await axios.get(`${paystackUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, paystackHeader);

    return response.data;
};

const createTransferRecipient = async (name, accountNumber, bankCode) => {
    const data = {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
    };

    const response = await axios.post(`${paystackUrl}/transferrecipient`, data, paystackHeader);

    return response.data;
};

const initiateTransfer = async (amount, recipient) => {
    const data = {
        source: 'balance',
        amount,
        recipient,
        reason: 'Transfer Payment'
    };

    const response = await axios.post(`${paystackUrl}/transfer`, data, paystackHeader);

    return response.data;
};

const createRefund = async (reference) => {
    const data = { transaction: reference };

    const response = await axios.post(`${paystackUrl}/refund`, data, paystackHeader);

    return response.data;
}

export { verifyPayment, chargeCard, addPaystackChargeToamount, verifyAccountNumber, createTransferRecipient, initiateTransfer, createRefund };