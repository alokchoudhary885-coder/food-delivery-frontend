/**
 * @file src/utils/geo.js
 * @description Geolocation & distance calculation utilities.
 */

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // distance in km rounded to 1 decimal place
}

// Preset Indian city coordinates for quick lookup if GPS lat/lng not provided on restaurant
export const CITY_COORDS = {
  jaipur:    { lat: 26.9124, lng: 75.7873 },
  delhi:     { lat: 28.6139, lng: 77.2090 },
  mumbai:    { lat: 19.0760, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  kolkata:   { lat: 22.5726, lng: 88.3639 },
  chennai:   { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  pune:      { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  lucknow:   { lat: 26.8467, lng: 80.9462 },
};
