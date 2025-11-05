import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { VinLookupResponse } from './interfaces/vin-lookup-response.interface';
import { LoggerUtil } from '../../common/utils/logger.util';

/**
 * Service for decoding VINs using external API
 * Integrates with RapidAPI VIN Lookup service
 */
@Injectable()
export class VinDecoderService {
  private readonly logger = new LoggerUtil('VinDecoderService');
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiHost: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('rapidApiKey') || '';
    this.apiHost = this.configService.get<string>('rapidApiHost') || '';

    // Configure axios instance for RapidAPI
    this.axiosInstance = axios.create({
      baseURL: `https://${this.apiHost}`,
      headers: {
        'X-RapidAPI-Key': this.apiKey || '',
        'X-RapidAPI-Host': this.apiHost,
      },
      timeout: 10000, // 10 second timeout
    });
  }

  /**
   * Decode VIN using external API
   * Falls back to mock data if API key is not configured
   */
  async decodeVin(vin: string): Promise<VinLookupResponse> {
    this.logger.log('Decoding VIN', { vin });

    // Validate VIN format
    if (!this.isValidVin(vin)) {
      throw new BadRequestException('Invalid VIN format');
    }

    // If no API key, return mock data
    if (!this.apiKey) {
      this.logger.warn('No RapidAPI key configured, using mock data');
      return this.getMockVinData(vin);
    }

    try {
      // Call RapidAPI VIN lookup
      const response = await this.axiosInstance.get(`/search_vin?=vin=${vin}`);
      
      this.logger.log('VIN decoded successfully', { vin });
      return response.data;
    } catch (error) {
      this.logger.error('VIN decode failed, using mock data', error.message);
      
      // Fallback to mock data if API fails
      return this.getMockVinData(vin);
    }
  }

  /**
   * Validate VIN format
   * Standard VIN is 17 characters, alphanumeric (excluding I, O, Q)
   */
  private isValidVin(vin: string): boolean {
    if (!vin || vin.length !== 17) {
      return false;
    }

    // VIN should not contain I, O, or Q
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }

  /**
   * Generate mock VIN data for development/testing
   * Returns realistic vehicle data based on VIN pattern
   */
  private getMockVinData(vin: string): VinLookupResponse {
    const currentYear = new Date().getFullYear();
    
    // Extract year from VIN (10th character represents model year)
    const yearChar = vin.charAt(9);
    const yearMap: { [key: string]: number } = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
      'S': 2025,
    };
    
    const year = yearMap[yearChar.toUpperCase()] || currentYear - 5;

    // Mock vehicle database
    const mockVehicles = [
      {
        make: 'Toyota',
        model: 'Camry',
        trim: 'XLE',
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_size: '2.5L',
        msrp: '28000',
      },
      {
        make: 'Honda',
        model: 'Accord',
        trim: 'Sport',
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_size: '2.0L',
        msrp: '27000',
      },
      {
        make: 'Ford',
        model: 'F-150',
        trim: 'XLT',
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_size: '3.5L',
        msrp: '42000',
      },
      {
        make: 'Tesla',
        model: 'Model 3',
        trim: 'Long Range',
        fuel_type: 'Electric',
        transmission: 'Automatic',
        engine_size: 'Electric Motor',
        msrp: '45000',
      },
      {
        make: 'BMW',
        model: '3 Series',
        trim: '330i',
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_size: '2.0L',
        msrp: '42000',
      },
    ];

    // Select vehicle based on VIN hash
    const vinHash = vin.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const selectedVehicle = mockVehicles[vinHash % mockVehicles.length];

    return {
      vin,
      year,
      make: selectedVehicle.make,
      model: selectedVehicle.model,
      trim: selectedVehicle.trim,
      fuel_type: selectedVehicle.fuel_type,
      transmission: selectedVehicle.transmission,
      engine_size: selectedVehicle.engine_size,
      manufacturer_suggested_retail_price: selectedVehicle.msrp,
      style: 'Sedan',
      doors: 4,
      standard_seating: 5,
      drivetrain: 'FWD',
      city_mileage: '28 mpg',
      highway_mileage: '39 mpg',
    };
  }
}