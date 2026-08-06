import mongoose, { Schema } from 'mongoose';

// Singleton document holding the Project Cost Estimator pricing.
// Shape mirrors PricingConfig in lib/estimatorPricing.ts.

const RangeSchema = new Schema({ min: Number, max: Number }, { _id: false });

const TypeSchema = new Schema(
  { key: String, label: String, blurb: String, base: RangeSchema, weeks: RangeSchema, unit: String },
  { _id: false },
);
const SizeSchema = new Schema(
  { key: String, label: String, hint: String, cost: Number, weeks: Number },
  { _id: false },
);
const FeatureSchema = new Schema(
  { id: String, label: String, cost: RangeSchema, weeks: Number },
  { _id: false },
);
const DesignSchema = new Schema(
  { key: String, label: String, hint: String, mult: Number },
  { _id: false },
);
const DomainSchema = new Schema(
  { key: String, label: String, mult: Number },
  { _id: false },
);
const GrowthSchema = new Schema(
  { id: String, label: String, hint: String, cost: RangeSchema, weeks: Number },
  { _id: false },
);

const RegionSchema = new Schema(
  {
    code: String,
    label: String,
    currencySymbol: String,
    currencyCode: String,
    countries: { type: [String], default: [] },
    multiplier: { type: Number, default: 1 },
    roundTo: { type: Number, default: 100 },
  },
  { _id: false },
);

const PricingConfigSchema: Schema = new Schema(
  {
    currencySymbol: { type: String, default: '$' },
    currencyCode: { type: String, default: 'USD' },
    regions: { type: [RegionSchema], default: [] },
    defaultRegion: { type: String, default: 'base' },
    types: { type: [TypeSchema], default: [] },
    sizes: { type: [SizeSchema], default: [] },
    features: { type: [FeatureSchema], default: [] },
    designLevels: { type: [DesignSchema], default: [] },
    domains: { type: [DomainSchema], default: [] },
    growth: { type: [GrowthSchema], default: [] },
    rushCostMult: { type: Number, default: 1.3 },
    rushWeeksMult: { type: Number, default: 0.65 },
  },
  { timestamps: true },
);

export default mongoose.models.PricingConfig ||
  mongoose.model('PricingConfig', PricingConfigSchema);
