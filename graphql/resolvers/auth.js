const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// models
const User = require('../../models/user');

module.exports = {
  createUser: (args) => {
    return User.findOne({ email: args.userInput.email })
      .then((user) => {
        if (user) {
          throw new Error('User exists already, please login');
        }

        return bcrypt.hash(args.userInput.password, 12);
      })
      .then((hashedPassword) => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });

        return user.save();
      })
      .then((result) => {
        return { ...result._doc, password: null };
      })
      .catch((err) => {
        throw err;
      });
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error('User does not exist');
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      throw new Error('Invalid credentials please check and try again');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'thisIsmyscrete',
      { expiresIn: '1h' }
    );

    return { token, userId: user.id, tokenExpiration: 1 };
  }
};
