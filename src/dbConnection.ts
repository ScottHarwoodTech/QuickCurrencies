import mongoose from "mongoose"
import logger from "./logger"
if (!process.env.MONGODB_URI) throw new Error("DB URI not set")

export const db = mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.on("error", (e) => {
  logger.error(e)
})
