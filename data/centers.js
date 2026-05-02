import { centers } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const isOpenNow = (center) => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = days[new Date().getDay()];

  const hours = center[`${today}_open`];

  if (!hours || hours === "Closed") return false;

  const parts = hours.split("-");
  if (parts.length !== 2) return false;

  const parseTime = (timeStr) => {
    let [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const openTime = parseTime(parts[0]);
  const closeTime = parseTime(parts[1]);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= openTime && currentMinutes <= closeTime;
};

const getAllCenters = async () => {
  const centerCollection = await centers();
  const centerList = await centerCollection.find({}).toArray();

  return centerList.map((center) => {
    center._id = center._id.toString();
    center.isOpen = isOpenNow(center);
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
  center.isOpen = isOpenNow(center);

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
    query.borough_name = {
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

  if (filters.deviceType && filters.deviceType.trim()) {
    query.type_of_device_available = {
      $regex: filters.deviceType.trim(),
      $options: "i"
    };
  }

  let results = await centerCollection.find(query).toArray();

  if (filters.operatingStatus && filters.operatingStatus.trim()) {
    const status = filters.operatingStatus.trim().toLowerCase();

    if (status === "open") {
      results = results.filter((center) => isOpenNow(center));
    }

    if (status === "closed") {
      results = results.filter((center) => !isOpenNow(center));
    }
  }

  return results.map((center) => {
    center._id = center._id.toString();
    center.isOpen = isOpenNow(center);
    return center;
  });
};

export { getAllCenters, getCenterById, getCentersByFilter };
