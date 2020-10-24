import { config } from "dotenv";
config();
import { MongoClient } from "mongodb";
import { readdirSync, readFileSync } from "fs";
import path from "path";

const main = async () => {
  if (!process.env.MONGODB_URI || !process.env.EXPORT_DIR) {
    throw new Error("not found");
  }
  const EXPORT_DIR = process.env.EXPORT_DIR;

  const connection = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await connection.connect();
  const db = connection.db();

  const files = readdirSync(path.resolve(path.join(process.cwd(), EXPORT_DIR)));

  await Promise.all(
    files.map(async (fileName) => {
      const collection = fileName.split(".")[0];
      const content = JSON.parse(
        readFileSync(path.join(process.cwd(), EXPORT_DIR, fileName)).toString()
      );
      await db.collection(collection).insertMany(content);
    })
  );
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
