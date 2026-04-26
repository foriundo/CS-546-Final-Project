import { ObjectId } from "mongodb";
import { reports } from "../config/mongoCollections.js";
import { checkString, checkId } from "./users.js";

const checkIssueType = (issueType) => {
    const validIssueTypes = ['incorrect hours', 'incorrect address', 'other'];
    if (!issueType || typeof issueType !== "string") throw 'Issue type must be a non-empty string';
    issueType = issueType.trim();
    if (!issueType) throw 'issue type cannot be empty or just spaces';
    if (!validIssueTypes.includes(issueType)) throw `${issueType} is not a valid issue type`;
    return issueType;
}


const createReport = async (centerId, userId, issueType, description) => {
    // Input validation
    centerId = checkId(centerId, "Center ID");
    userId = checkId(userId, "User ID");
    issueType = checkIssueType(issueType);
    description = checkString(description, "Description");
    const dateTime = new Date();
    const reportsCollection = await reports();

    const newIssue = {
        centerId: new ObjectId(centerId),
        reportedBy: new ObjectId(userId),
        issueType: issueType,
        description: description,
        status: "pending",
        moderationNotes: null,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: dateTime,
        updatedAt: null
    };

    const insertInfo = await reportsCollection.insertOne(newIssue);

    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not report issue'

    const newID = insertInfo.insertedId.toString();
    const issue_report = await getReportById(newID);

    return issue_report;
}

const getReportById = async (reportId) => {
    reportId = checkId(reportId, "Report ID")
    const reportsCollection = await reports();
    const report = await reportsCollection.findOne({ _id: new ObjectId(reportId) });
    if (!report) throw `No report found with id ${reportId}`;
    return report;
}



export { createReport, getReportById };
 