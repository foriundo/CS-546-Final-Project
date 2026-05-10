import { centers } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { checkId } from "./users.js";

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

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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


const getCentersByFilter = async (filters = {}) => {
  const centerCollection = await centers();
  let query = {};

  if (filters.name && filters.name.trim()) {
    query.location_name = {
      $regex: escapeRegex(filters.name.trim()),
      $options: "i"
    };
  }

  if (filters.borough && filters.borough.trim()) {
    query.borough_name = {
      $regex: escapeRegex(filters.borough.trim()),
      $options: "i"
    };
  }

  if (filters.organizationName && filters.organizationName.trim()) {
    query.operator_name = {
      $regex: escapeRegex(filters.organizationName.trim()),
      $options: "i"
    };
  }

  if (filters.deviceType && filters.deviceType.trim()) {
    query.type_of_device_available = {
      $regex: escapeRegex(filters.deviceType.trim()),
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

const checkCenterFields = (centerData) => {
  let {
    location_name,
    borough_name,
    address_street,
    operator_name,
    type_of_device_available,
    workstation_number,
    mon_open,
    tue_open,
    wed_open,
    thu_open,
    fri_open,
    sat_open,
    sun_open
  } = centerData;

  if (!location_name || typeof location_name !== "string" || !location_name.trim()) {
    throw new Error("Location name is required.");
  }

  if (!borough_name || typeof borough_name !== "string" || !borough_name.trim()) {
    throw new Error("Borough is required.");
  }

  if (!address_street || typeof address_street !== "string" || !address_street.trim()) {
    throw new Error("Address is required.");
  }

  if (!operator_name || typeof operator_name !== "string" || !operator_name.trim()) {
    throw new Error("Operator name is required.");
  }

  return {
    location_name: location_name.trim(),
    borough_name: borough_name.trim(),
    address_street: address_street.trim(),
    operator_name: operator_name.trim(),
    type_of_device_available: type_of_device_available?.trim() || "N/A",
    workstation_number: workstation_number?.trim() || "N/A",
    mon_open: mon_open?.trim() || "Unavailable",
    tue_open: tue_open?.trim() || "Unavailable",
    wed_open: wed_open?.trim() || "Unavailable",
    thu_open: thu_open?.trim() || "Unavailable",
    fri_open: fri_open?.trim() || "Unavailable",
    sat_open: sat_open?.trim() || "Unavailable",
    sun_open: sun_open?.trim() || "Unavailable",
    technology_related_courses: centerData.technology_related_courses || "N",
    productivity_tools_ex_using: centerData.productivity_tools_ex_using || "N",
    job_readiness_ex_resume_help: centerData.job_readiness_ex_resume_help || "N",
    education_ex_personal_growth: centerData.education_ex_personal_growth || "N",
    media_and_entertainment_ex: centerData.media_and_entertainment_ex || "N",
    certifications_ex_in_software: centerData.certifications_ex_in_software || "N",
    digital_literacy: centerData.digital_literacy || "N",
    
    full_location_phone_number:
      centerData.full_location_phone_number?.trim().toUpperCase() === "N/A" ? "N/A" : centerData.full_location_phone_number?.trim() || "N/A",

  url: {
    url:
      centerData.website?.trim().toUpperCase() === "N/A" ? "N/A" : centerData.website?.trim() || "N/A"
  },

  wheelchair_accessible:
    centerData.wheelchair_accessible || "N",

  assistive_technology:
    centerData.assistive_technology || "N"
    };
};

const createCenter = async (centerData) => {
  const cleanData = checkCenterFields(centerData);

  const centerCollection = await centers();

  const newCenter = {
    ...cleanData,
    createdAt: new Date(),
    updatedAt: null
  };

  const insertInfo = await centerCollection.insertOne(newCenter);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Could not add center.");
  }

  return await getCenterById(insertInfo.insertedId.toString());
};

const updateCenter = async (centerId, centerData) => {
  centerId = checkId(centerId, "Center ID");

  const cleanData = checkCenterFields(centerData);

  const centerCollection = await centers();

  const updateInfo = await centerCollection.updateOne(
    { _id: new ObjectId(centerId) },
    {
      $set: {
        ...cleanData,
        updatedAt: new Date()
      }
    }
  );

  if (updateInfo.matchedCount === 0) {
    throw new Error(`No center found with id ${centerId}`);
  }

  return await getCenterById(centerId);
};

const deleteCenter = async (centerId) => {
  centerId = checkId(centerId, "Center ID");

  const centerCollection = await centers();

  const deleteInfo = await centerCollection.deleteOne({
    _id: new ObjectId(centerId)
  });

  if (deleteInfo.deletedCount === 0) {
    throw new Error(`No center found with id ${centerId}`);
  }

  return true;
};

export {
  getAllCenters,
  getCenterById,
  getCentersByFilter,
  createCenter,
  updateCenter,
  deleteCenter
};
