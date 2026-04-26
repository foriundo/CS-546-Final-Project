import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";

const saltRounds = 12;

const checkString = (value, name) => {
  if (!value || typeof value !== "string") throw `${name} must be a non-empty string`;
  value = value.trim();
  if (!value) throw `${name} cannot be empty or just spaces`;
  return value;
};

const checkEmail = (email) => {
  email = checkString(email, "Email").toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw "Invalid email format";
  return email;
};

const checkPassword = (password) => {
  if (!password || typeof password !== "string") {
    throw "Password must be provided";
  }

  password = password.trim();

  if (password.length < 8) {
    throw "Password must be at least 8 characters";
  }

  return password;
};

const checkId = (id, name = "Id") => {
  id = checkString(id, name);
  if (!ObjectId.isValid(id)) throw `${name} is invalid`;
  return id;
};

export const createUserIndexes = async () => {
  const userCollection = await users();
  await userCollection.createIndex({ email: 1 }, { unique: true });
};

export const getUserByEmail = async (email) => {
  email = checkEmail(email);
  const userCollection = await users();
  return await userCollection.findOne({ email });
};

export const getUserById = async (id) => {
  id = checkId(id, "User id");

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });

  if (!user) throw "User not found";

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    favorites: user.favorites || []
  };
};

export const registerUser = async (name, email, password) => {
  name = checkString(name, "Name");
  email = checkEmail(email);
  password = checkPassword(password);

  const userCollection = await users();

  const existingUser = await userCollection.findOne({ email });
  if (existingUser) {
    throw "An account with that email already exists";
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = {
    name,
    email,
    hashedPassword,
    favorites: [],
    createdAt: new Date()
  };

  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Could not create user";
  }

  return {
    _id: insertInfo.insertedId.toString(),
    name: newUser.name,
    email: newUser.email
  };
};

export const loginUser = async (email, password) => {
  email = checkEmail(email);
  password = checkPassword(password);

  const userCollection = await users();
  const user = await userCollection.findOne({ email });

  if (!user) {
    throw "Either the email or password is invalid";
  }

  const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

  if (!passwordMatch) {
    throw "Either the email or password is invalid";
  }

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email
  };
};

export {checkString, checkEmail, checkId, checkPassword, createUserIndexes, getUserByEmail, getUserById, registerUser, loginUser};