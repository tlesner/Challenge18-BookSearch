import { AuthenticationError } from "apollo-server";
import  User from "../models/User.js";
import { signToken } from "../utils/auth.js";
//import { isContext } from "vm";
//import type { Context } from '../types/express/index.js';

interface IUserContext { 
  user: {
    username: string | null;
    email: string | null;
    _id: string | null;
  } | null;
}

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        console.log(context.user)
        return await User.findOne({ _id: context.user._id }).populate(
          "savedBooks"
        );
      }
      throw new AuthenticationError("Not Authenticated");
    },
  },

  Mutation: {
    login: async ( _parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError("User or password incorrect");
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addUser: async (_parent: unknown,{ username, email, password }: { username: string; email: string; password: string } ) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    saveBook: async ( _parent: any, { book }: { book: any }, context: IUserContext ) => {
      console.log(context.user);
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: book } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError("User Could Not Be Found");
    },
    removeBook: async (
      _parent: unknown,
      { bookId }: { bookId: string },
      context: { user: any }
    ) => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $pull: { savedBooks: { bookId } },
          },
          { new: true }
        );
      }
      throw new AuthenticationError("User Could Not Be Found");
    },
  },
};

export default resolvers;