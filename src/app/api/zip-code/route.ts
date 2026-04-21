import { NextResponse } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const searchParams = new URLSearchParams({
      format: 'json',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '18',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_URL}?${searchParams.toString()}`, {
      headers: {
        'User-Agent': 'BappleCompass/1.0 (contact: local-app)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Reverse geocoding failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const zipCode = data.address?.postcode;

    if (!zipCode) {
      return NextResponse.json(
        { error: 'Zip code unavailable for this location' },
        { status: 404 }
      );
    }

    return NextResponse.json({ zipCode });
  } catch (error) {
    console.error('Zip code lookup failed:', error);
    return NextResponse.json(
      { error: 'Unable to resolve zip code' },
      { status: 500 }
    );
  }
}
