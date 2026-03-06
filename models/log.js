const mongoose = require('mongoose');
const logSchema = new mongoose.Schema(
  {
    action: {
      type:     String,
      enum:     ['CREATE', 'EDIT', 'DELETE', 'IMPORT'],
      required: true,
    },
    plate:      { type: String,  default: null },
    vehicle_id: { type: Number,  default: null },
    detail:     { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: 'date', updatedAt: false },
  }
);

logSchema.statics.saveLog = async function (action, data) {
  try {
    await this.create({ action, ...data });
  } catch (_) {}
};

const Log = mongoose.model('Log', logSchema);

module.exports = Log;