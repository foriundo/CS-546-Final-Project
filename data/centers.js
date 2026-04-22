import { centers } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const getAllCenters = async () => {
  const centerCollection = await centers();
  return await centerCollection.find({}).toArray();
};

const getCenterById = async (id) => {
  if (!id || typeof id !== "string") throw new Error("ID must be provided.");

  id = id.trim();

  if (!ObjectId.isValid(id)) throw new Error ("Invalid id");

  const centerCollection = await centers();
  const center = await centerCollection.findOne({ _id: new ObjectId(id) });
  if (!center) throw new Error(`No center found with id ${id}.`);
  return center;
};

// TODO: implement filtering by borough, deviceType, operatingStatus
const getCentersByFilter = async (filters = {}) => {
  const centerCollection = await centers();
  let query = {};

  if (filters.name && filters.name.trim()) {
    query.location_name = {
      $regex: filters.name.trim(),
      $options: "i"
    };
  }

  if (filters.borough && filters.borough.trim()) {
    query.borough = filters.borough.trim();
  }

  if (filters.organizationName && filters.organizationName.trim()) {
    query.operator_name = {
      $regex: filters.organizationName.trim(),
      $options: "i"
    };
  }

  return await centerCollection.find(filters).toArray();
};

export { getAllCenters, getCenterById, getCentersByFilter };
