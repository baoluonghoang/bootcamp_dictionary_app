const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please a course title"],
  },
  description: {
    type: String,
    required: [true, "Please a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please a number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please a tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please a minimum skill "],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

//Get averageCost
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

//Call getAverageCost after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

//Call getAverageCost before remove
CourseSchema.post("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
