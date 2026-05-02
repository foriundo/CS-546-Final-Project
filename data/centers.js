import { centers } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const getAllCenters = async () => {
  const centerCollection = await centers();
  const centerList = await centerCollection.find({}).toArray();

  return centerList.map((center) => {
    center._id = center._id.toString();
    return center;
  });
};

const getCenterById = async (id) => {
  if (!id || typeof id !== "string") throw new Error("ID must be provided.");

  id = id.trim();

  if (!ObjectId.isValid(id)) throw new Error ("Invalid id");

  const centerCollection = await centers();
  const center = await centerCollection.findOne({ _id: new ObjectId(id) });
  if (!center) throw new Error(`No center found with id ${id}.`);
  center._id = center._id.toString();
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
    query.borough = {
      $regex: filters.borough.trim(),
      $options: "i"
    };
  }

  if (filters.organizationName && filters.organizationName.trim()) {
    query.operator_name = {
      $regex: filters.organizationName.trim(),
      $options: "i"
    };
  }

  const results = await centerCollection.find(query).toArray();

  return results.map((center) => {
    center._id = center._id.toString();
    return center;
  });
};

export { getAllCenters, getCenterById, getCentersByFilter };
