export const toCurrency = (amount) => {
    return Number(amount).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN'
    });
};

const formatItems = (items) => items.map(item => {
    item.price = toCurrency(item.price);
    return item;
});

export { formatItems };