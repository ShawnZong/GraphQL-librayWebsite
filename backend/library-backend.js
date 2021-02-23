// Apollo
const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const { v1: uuid } = require("uuid");

// mongoose
const config = require("./utils/config");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const mongoose = require("mongoose");

// token
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

mongoose
  .connect(config.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    createUser(
      username: String!
      password: String!
      favoriteGenre: String!
    ): User

    login(username: String!, password: String!): Token

    addAuthor(name: String!, born: Int): Author

    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(name: String!, setBornTo: Int): Author
  }
`;

const resolvers = {
  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({ author: root.id });
    },
  },
  Mutation: {
    // createUser(username: String!, favoriteGenre: String!): User
    createUser: async (root, args) => {
      const user = new User({ ...args });
      user.password = await bcrypt.hash(
        user.password,
        Number(config.SALT_ROUNDS)
      );
      try {
        return user.save();
      } catch (e) {
        throw new UserInputError(e.message, { invalidArgs: args });
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      const IsPwd = await bcrypt.compare(args.password, user.password);
      if (!user || !IsPwd) {
        throw new UserInputError("wrong credentials");
      }
      const userToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userToken, config.JWT_SECRET) };
    },

    addAuthor: async (root, args, context) => {
      // authenticate user
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const author = new Author({ ...args });
      try {
        return author.save();
      } catch (e) {
        console.log(e);
        throw new UserInputError(e.message, { invalidArgs: args });
      }
    },
    addBook: async (root, args, context) => {
      // authenticate user
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      // check whether there's an author
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (e) {
          throw new UserInputError(e.message, { invalidArgs: args });
        }
      }

      // add new book
      const book = new Book({ ...args, author: author });
      try {
        return book.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
    },
    editAuthor: async (root, args, context) => {
      // authenticate user
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      const author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;
      try {
        return author.save();
      } catch (e) {
        throw new UserInputError(e.message, { invalidArgs: args });
      }
    },
  },
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        const authorInDB = await Author.findOne({ name: args.author });
        if (!authorInDB) {
          throw new UserInputError("no such author", { invalidArgs: args });
        }
        return Book.find({ author: authorInDB._id }).populate("author");
      } else if (args.genre) {
        return Book.find({ genres: { $in: args.genre } }).populate("author");
      }

      return Book.find({}).populate("author");
    },
    allAuthors: (root, args) => {
      return Author.find({});
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
