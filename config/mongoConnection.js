import { MongoClient } from "mongodb";
import { dbSettings } from "./settings.js";

const { mongoConfig } = dbSettings;

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }
  return _db;
};

const closeConnection = async () => {
  if (_connection) {
    await _connection.close();
    _connection = undefined;
    _db = undefined;
  }
};

export { dbConnection, closeConnection };
