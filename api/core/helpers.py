from bson import ObjectId


def serializeMongoDoc(doc: dict):
    if not doc:
        return doc

    # Convert Mongo _id → API id
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))

    # Convert all ObjectId fields → string
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)

    return doc
