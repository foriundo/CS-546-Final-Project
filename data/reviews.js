import { ObjectId } from "mongodb";
import { reviews} from "../config/mongoCollections.js";

const checkString = (value, name) => {
    if (!value || typeof value !== "string") throw `${name} must be a non-empty string`;
    value = value.trim();
    if (!value) throw `${name} cannot be empty or just spaces`;
    return value;
}

const checkId = (id, name = "Id") => {
    id = checkString(id, name);
    if (!ObjectId.isValid(id)) throw `${name} is invalid`;
    return id;
};

export const addReview = async (centerId, userId, userName, rating, comment) => {
    centerId = checkId(centerId, "Center id");
    userId = checkId(userId, "User id");
    userName = checkString(userName, "User name");
    comment = checkString(comment, "Comment");

    rating = parseInt(rating);
    if (isNaN(rating) || rating < 1 || rating > 5) throw "Rating must be between 1 and 5";

    const reviewCollection = await reviews();

    const newReview = {
        centerId: new ObjectId(centerId),
        userId: new ObjectId(userId),
        userName,
        rating,
        comment,
        createdAt: new Date()
    };

    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Failed to add review";

    return { ...newReview, _id: insertInfo.insertedId.toString() };
};

export const getReviewsByCenter = async (centerId) => {
    centerId = checkId(centerId, "Center id");

    const reviewCollection = await reviews();
    const reviewList = await reviewCollection
        .find({ centerId: new ObjectId(centerId) })
        .sort({ createdAt: -1 })
        .toArray();

    return reviewList.map((r) => ({
        ...r,
        _id: r._id.toString(),
        userId: r.userId.toString(),
        centerId: r.centerId.toString()
    }));
};


export const getReviewsByUser = async (userId) => {
    userId = checkId(userId, "User id");

    const reviewCollection = await reviews();
    return await reviewCollection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
};

export const deleteReview = async (reviewId, userId) => {
    reviewId = checkId(reviewId, "Review id");
    userId = checkId(userId, "User id");

    const reviewCollection = await reviews();

    const review = await reviewCollection.findOne({ _id: new ObjectId(reviewId) });
    if (!review) throw "Review not found";
    if (review.userId.toString() !== userId) throw "You can only delete your own reviews";

    const deleteInfo = await reviewCollection.deleteOne({ _id: new ObjectId(reviewId) });
    if (deleteInfo.deletedCount === 0) throw "Could not delete review";

    return { deleted: true };
};