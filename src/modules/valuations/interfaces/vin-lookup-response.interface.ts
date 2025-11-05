
export interface VinLookupResponse {
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  style?: string;
  type?: string;
  size?: string;
  category?: string;
  made_in?: string;
  made_in_city?: string;
  doors?: number;
  fuel_type?: string;
  fuel_capacity?: string;
  city_mileage?: string;
  highway_mileage?: string;
  engine?: string;
  engine_size?: string;
  engine_cylinders?: number;
  transmission?: string;
  transmission_type?: string;
  transmission_speeds?: string;
  drivetrain?: string;
  anti_brake_system?: string;
  steering_type?: string;
  curb_weight?: string;
  gross_vehicle_weight_rating?: string;
  overall_height?: string;
  overall_length?: string;
  overall_width?: string;
  wheelbase?: string;
  standard_seating?: number;
  invoice_price?: string;
  delivery_charges?: string;
  manufacturer_suggested_retail_price?: string;
  production_seq_number?: string;
  front_brake_type?: string;
  rear_brake_type?: string;
  turning_diameter?: string;
  front_suspension?: string;
  rear_suspension?: string;
  front_headroom?: string;
  rear_headroom?: string;
  front_legroom?: string;
  rear_legroom?: string;
  front_shoulder_room?: string;
  rear_shoulder_room?: string;
  front_hip_room?: string;
  rear_hip_room?: string;
  interior_trim?: string;
  exterior_color?: string;
  interior_color?: string;
}

/**
 * Valuation factors interface
 */
export interface ValuationFactors {
  age: number; // Age of vehicle in years
  mileage: number; // Current mileage
  condition: string; // Vehicle condition
  marketDemand: number; // Market demand score (0-100)
  locationAdjustment: number; // Location-based adjustment
  seasonalFactor: number; // Seasonal adjustment
  depreciationRate: number; // Annual depreciation rate
}