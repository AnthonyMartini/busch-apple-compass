import { NextResponse } from 'next/server';

const BUSCH_API_URL = 'https://api.beertech.com/singularity/graphql';

export async function POST(request: Request) {
  try {
    const { zipCode } = await request.json();
    const normalizedZipCode = String(zipCode ?? '').trim();

    if (!normalizedZipCode) {
      return NextResponse.json({ error: 'Zip code is required' }, { status: 400 });
    }

    const query = `
      query LocateRetailers($zipCode: String!, $radius: Float!) {
        locateRetailers(
          brandName: "BUSCH LT APPLE"
          limit: 100
          zipCode: $zipCode
          radius: $radius
          productDescriptions: [
            "BUSCH LIGHT APPLE 30/12 OZ CAN DSTK",
            "BUSCH LIGHT APPLE 24/12 OZ CAN 2/12",
            "BUSCH LIGHT APPLE 15/25 AL CAN SHRINK",
            "BUSCH LIGHT APPLE 24/12 OZ CAN",
            "BUSCH LIGHT APPLE 48/12 AL CAN",
            "BUSCH LIGHT APPLE 24/16 OZ CAN 4/6",
            "BUSCH LIGHT APPLE 1/2 BBL SV"
          ]
        ) {
          retailers {
            vpid
            name
            address
            city
            state
            zipCode
            latitude
            longitude
            distance
          }
        }
      }
    `;

    const response = await fetch(BUSCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://www.busch.com/',
        'Origin': 'https://www.busch.com/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      },
      body: JSON.stringify({
        query,
        variables: {
          zipCode: normalizedZipCode,
          radius: 2500.0,
        },
      }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Busch API returned non-JSON response:', text.slice(0, 500));
      return NextResponse.json({ 
        error: 'API blocked or returned invalid format', 
        details: 'The backend returned an HTML page instead of data. This usually means the request was blocked.' 
      }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error';

    console.error('Internal Server Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message,
    }, { status: 500 });
  }
}
