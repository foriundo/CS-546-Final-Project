import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;
  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = db.collection(collection);
    }
    return _col;
  };
};

export const centers = getCollectionFn("centers");
export const users = getCollectionFn("users");
export const reviews = getCollectionFn("reviews");
export const reports = getCollectionFn("reports");