import type { components } from './api-types';

/**
 * Bi danh cho cac schema sinh tu `openapi.json`.
 *
 * Gom o mot cho de phan con lai cua ung dung khong phai viet lai chuoi
 * `components['schemas'][...]` moi lan dung.
 */
type Schemas = components['schemas'];

export type BoundingBox = Schemas['BoundingBox'];
export type CarListResponse = Schemas['CarListResponse'];
export type CarSpecs = Schemas['CarSpecs'];
export type DetectedVehicle = Schemas['DetectedVehicle'];
export type FilterOptions = Schemas['FilterOptions'];
export type HealthResponse = Schemas['HealthResponse'];
export type Prediction = Schemas['Prediction'];
export type ReadinessResponse = Schemas['ReadinessResponse'];
export type RecognitionResponse = Schemas['RecognitionResponse'];
export type RecommendRequest = Schemas['RecommendRequest'];
export type RecommendResponse = Schemas['RecommendResponse'];
export type RecommendedCar = Schemas['RecommendedCar'];

/** Tham so loc cho endpoint `/api/v1/cars`. */
export interface CarListQuery {
  brand?: string | null;
  bodyStyle?: string | null;
  segment?: string | null;
  limit?: number;
  offset?: number;
}

/** Tuy chon cho endpoint `/api/v1/recognize`. */
export interface RecognizeOptions {
  topK?: number;
  includeSimilar?: boolean;
  similarCount?: number;
}
