const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return tags.length <= 10; // Maximum 10 tags
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  json_file_url: {
    type: String,
    required: [true, 'JSON file URL is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ status: 1, created_at: -1 });

// Method to get sessions without sensitive data
sessionSchema.methods.toPublicJSON = function() {
  const session = this.toObject();
  delete session.user_id;
  return session;
};

module.exports = mongoose.model('Session', sessionSchema); 