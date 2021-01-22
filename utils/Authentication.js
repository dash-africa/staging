import bcrypt from 'bcryptjs';

const hashPassword = password => new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(password, salt, (err, hash) => 
            err ? reject(err) : resolve(hash)
        )
    );
});

export { hashPassword };