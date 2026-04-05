import { centers } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

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
    query.borough_name = { $regex: `^${filters.borough}$`, $options: "i" };
  }

  if (filters.deviceType) {
    // type_of_device_available is a comma-separated string, so use regex to match any entry
    query.type_of_device_available = {
      $regex: filters.deviceType,
      $options: "i",
    };
  }

  if (filters.search) {
    query.$or = [
      { location_name: { $regex: filters.search, $options: "i" } },
      { operator_name: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.operatingStatus) {
    const dayFields = ["sun_open", "mon_open", "tue_open", "wed_open", "thu_open", "fri_open", "sat_open"];
    const todayField = dayFields[new Date().getDay()];
    if (filters.operatingStatus === "open") {
      query[todayField] = { $ne: "Closed" };
    } else if (filters.operatingStatus === "closed") {
      query[todayField] = "Closed";
    }
  }

  const centerCollection = await centers();
  return await centerCollection.find(query).sort({ location_name: 1 }).toArray();
};

export { getAllCenters, getCenterById, getCentersByFilter };
