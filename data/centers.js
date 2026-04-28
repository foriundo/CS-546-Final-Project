import { centers } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const getAllCenters = async () => {
  // TODO: implement
  const centerCollection = await centers();
  const centerList = await centerCollection.find({}).toArray();

  return centerList.map((center) => {
    center._id = center._id.toString();
    return center;
  });
};

const getCenterById = async (id) => {
  // TODO: implement with validation
  if (!id || !ObjectId.isValid(id)) throw new Error("Invalid id provided.");
  const centerCollection = await centers();
  const center = await centerCollection.findOne({ _id: new ObjectId(id) });
  if (!center) throw new Error(`No center found with id ${id}.`);
  return center;
};

const getCentersByFilter = async (filters = {}) => {
  // TODO: implement filtering by borough, deviceType, operatingStatus
  const centerCollection = await centers();
  return await centerCollection.find(filters).toArray();
};

export { getAllCenters, getCenterById, getCentersByFilter };
