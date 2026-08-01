import React, { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

// Google Maps API key should be set in .env as REACT_APP_GOOGLE_MAPS_API_KEY
const libraries = ['places'];

export default function VenueAutocomplete({ onSelect }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;
    const address = place.formatted_address || '';
    const location = place.geometry?.location;
    const coordinates = location ? [location.lng(), location.lat()] : [77.5946, 12.9716]; // fallback to Bengaluru
    onSelect({ address, coordinates });
  };

  return (
    <div className="relative">
      {isLoaded && (
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
          }}
          onPlaceChanged={handlePlaceChanged}
          fields={['formatted_address', 'geometry']}
          options={{
            componentRestrictions: { country: 'in' },
            types: ['establishment', 'geocode'],
          }}
        >
          <input
            type="text"
            placeholder="Search venue (Indian locations only)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-monochrome-900 border border-monochrome-700 text-white focus:outline-none"
          />
        </Autocomplete>
      )}
      {!isLoaded && (
        <div className="flex items-center space-x-2 text-monochrome-400">
          <MapPin className="w-4 h-4" />
          <span>Loading Maps...</span>
        </div>
      )}
    </div>
  );
}
