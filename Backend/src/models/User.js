import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim:true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true,
    enum: ['student', 'instructor','admin']
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: function() { return this.role === 'student'; }
  },
  assignedInstructors: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: [],
    validate: {
      validator: function(v) {
        // Only students can have assigned instructors
        return this.role === 'student' || v.length === 0;
      },
      message: 'Only students can have assigned instructors'
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});


userSchema.pre('save', function(next) {
  if (this.role !== 'student' && this.assignedInstructors && this.assignedInstructors.length > 0) {
    this.assignedInstructors = [];
  }
  next();
});

// Instance method to get user without password
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Instance method to check if student has a specific instructor
userSchema.methods.hasInstructor = function(instructorId) {
  return this.assignedInstructors.some(id => id.equals(instructorId));
};

// Instance method to add an instructor (prevents duplicates)
userSchema.methods.addInstructor = async function(instructorId) {
  if (this.role !== 'student') {
    throw new Error('Only students can have instructors');
  }
  
  if (!this.hasInstructor(instructorId)) {
    this.assignedInstructors.push(instructorId);
    return this.save();
  }
  return this;
};

// Instance method to remove an instructor
userSchema.methods.removeInstructor = async function(instructorId) {
  this.assignedInstructors = this.assignedInstructors.filter(
    id => !id.equals(instructorId)
  );
  return this.save();
};

userSchema.statics.findByUserName = function (userName) {
  return this.findOne({ userName: userName.toLowerCase() });
}

const User = mongoose.model('User', userSchema);

export default User; 