const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");
// const emailValidator = require("validator").isEmail;
//eiWujye%6fP9sWm
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter Job title."],
    trim: true,
    maxlength: [100, "Job title cannot exceed 100 characters."],
  },
  slug: String,
  description: {
    type: String,
    requied: [true, "Please enter Job description."],
    maxlength: [1000, "Job description cannot exceed 1000 characters."],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please enter a valid Email address."],
  },
  address: {
    type: String,
    required: [true, "Please add an address."],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    fromattedAddress: String,
    city: String,
    sate: String,
    zipcode: String,
    country: String,
  },
  company: {
    type: String,
    required: [true, "Please enter Company name."],
  },
  industry: {
    type: [String],
    required: [true, "Please enter industry."],
    enum: {
      values: [
        "Business",
        "Information Technology",
        "Banking",
        "Education/Training",
        "Telecommuncation",
        "Others",
      ],
      message: "Please select correct option for industry.",
    },
  },
  jobType: {
    type: String,
    required: [true, "Please enter job type."],
    enum: {
      values: ["Permanent", "Temporary", "Internship"],
      message: "Please select correct option for job type.",
    },
  },
  minEducation: {
    type: String,
    required: [true, "Please enter minimum education."],
    enum: {
      values: ["Bachelors", "Masters", "Phd"],
      message: "Please select correct Education.",
    },
  },
  positions: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    required: [true, "Please enter experience."],
    enum: {
      values: ["No Experience", "1 - 3 Years", "2 - 3 Years", "5+ Years"],
      message: "Please select correct Experience.",
    },
  },

  salary: {
    type: Number,
    required: [true, " Please enter expected salary for this job."],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 7),
  },
  applicantsApplied: {
    type: [Object],
    select: false,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Creating Job Slug befoer saving

jobSchema.pre("save", function (next) {
  // Creating slug befoer saving to DB
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Setting up location
jobSchema.pre("save", async function (next) {
  const loc = await geoCoder.geocode(this.address);

  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    fromattedAddress: loc[0].fromattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
});
module.exports = mongoose.model("Job", jobSchema);
