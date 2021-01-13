const OrderStatus = Object.freeze(
    {
        NEW: 'new',
        DRIVER_ACCEPTED: 'driver_accepted',
        RESTAURANT_ACCEPTED :'restaurant_accepted',
        PICKED: 'picked',
        DELIVERED: 'delivered',
        COMPLETED: 'completed'
    }
);

export { OrderStatus };