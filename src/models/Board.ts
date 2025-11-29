export interface PropertyDetails {
  house_rent: Map<string, number>;
  house_price: number;
  property_price: number;
}

export interface SpecialDetails {
  action_keyword: string;
  action_details: string;
}

export interface UtilityDetails {
  utility_price: number;
  utility_rent_multiplier: Map<string, number>;
}

export interface TransportDetails {
  transport_rent: Map<string, number>;
  transport_price: number;
}

export interface EditionTerminology {
  player: string;
  property: string;
  transport: string;
  utility: string;
  house: string;
  hotel: string;
  property_rent: string;
  transport_rent: string;
  utility_rent: string;
  mortgage: string;
  passing_go: string;
  salary: string;
  jail: string;
  theft: string;
  parking: string;
  income_tax: string;
  luxury_tax: string;
  community_chest: string;
  chance: string;
}

export interface Cell {
  index: number;
  name: string;
  cell_type: string;
  cell_sub_type?: string;
  board_id: string;
  board_versions: string[];
  special_details?: SpecialDetails;
  property_details?: PropertyDetails;
  utility_details?: UtilityDetails;
  transport_details?: TransportDetails;
}

export interface Board {
  edition: string;
  id: string;
  version: string;
  currency: string;
  currency_symbol: string;
  mortgage_percentage: string;
  sell_percentage: string;
  terms: EditionTerminology;
  cells: FlattenedCell[];
}

export interface FlattenedCell {
  index: number;
  name: string;
  cell_type: string;
  cell_sub_type?: string;
  board_id: string;
  board_versions: string[];
  action_keyword?: string;
  action_details?: string;
  house_rent?: Map<string, number>;
  house_price?: number;
  property_price?: number;
  utility_price?: number;
  utility_rent_multiplier?: Map<string, number>;
  transport_price?: number;
  transport_rent?: Map<string, number>;
}
