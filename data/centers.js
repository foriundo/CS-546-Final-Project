import { centers } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const dayFields = ["sun_open", "mon_open", "tue_open", "wed_open", "thu_open", "fri_open", "sat_open"];

// needed this so regex doesn't break on weird input
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllCenters = async () => {
  const centerCollection = await centers();
  return await centerCollection.find({}).sort({ location_name: 1 }).toArray();
};

const getCenterById = async (id) => {
  if (!id || typeof id !== "string" || !ObjectId.isValid(id))
    throw new Error("Invalid id provided.");
  const centerCollection = await centers();
  const center = await centerCollection.findOne({ _id: new ObjectId(id) });
  if (!center) throw new Error(`No center found with id ${id}.`);
  return center;
};

const getCentersByFilter = async (filters = {}) => {
  const query = {};

  if (filters.borough) {
    query.borough_name = { $regex: `^${escapeRegex(filters.borough)}$`, $options: "i" };
  }

  if (filters.deviceType) {
    // device field is comma-separated so just check if the string is in there
    query.type_of_device_available = {
      $regex: escapeRegex(filters.deviceType),
      $options: "i",
    };
  }

  if (filters.search) {
    query.$or = [
      { location_name: { $regex: escapeRegex(filters.search), $options: "i" } },
      { operator_name: { $regex: escapeRegex(filters.search), $options: "i" } },
    ];
  }

  if (filters.operatingStatus) {
    const today = dayFields[new Date().getDay()];
    if (filters.operatingStatus === "open") {
      query[today] = { $ne: "Closed" };
    } else if (filters.operatingStatus === "closed") {
      query[today] = "Closed";
    }
  }

  const centerCollection = await centers();
  return await centerCollection.find(query).sort({ location_name: 1 }).toArray();
};

export { getAllCenters, getCenterById, getCentersByFilter };
