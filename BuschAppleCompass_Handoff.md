# Busch Apple Compass - Project Handover Document

## 1. Project Overview
**Premise**: A specialized mobile-centric web application that acts as a "compass" to lead users to the nearest retail location selling **Busch Light Apple**.
**User Flow**:
1.  User opens the app on their mobile device.
2.  App requests GPS permissions.
3.  App queries the Busch Retailer API to find nearby stockists.
4.  App identifies the single closest retailer.
5.  App displays a large, interactive compass needle pointing towards the store.
6.  App displays a real-time distance readout in meters/kilometers.

---

## 2. Technical Stack
-   **Framework**: Next.js (recommended for API proxy capabilities).
-   **Styling**: Vanilla CSS or Tailwind CSS (Dark Mode/Premium theme).
-   **APIs**:
    -   Browser Geolocation API (User positioning).
    -   Browser DeviceOrientation API (Compass/Heading).
    -   Anheuser-Busch Singularity GraphQL API (Retailer data).
-   **Icons/Assets**: SVG for the compass dial and needle.

---

## 3. Data Integration (The "Secret Sauce")

### Retailer API Details
The app relies on the Busch website's backend service.

-   **Endpoint**: `https://api.beertech.com/singularity/graphql`
-   **Method**: `POST`
-   **Payload**:
```json
{
  "query": "query LocateRetailers {\n    locateRetailers(\n        brandName: \"BUSCH LT APPLE\"\n        limit: 100\n        zipCode: \"[USER_ZIP]\"\n        radius: 25.0\n        productDescriptions: [\"BUSCH LIGHT APPLE 30/12 OZ CAN DSTK\",\"BUSCH LIGHT APPLE 24/12 OZ CAN 2/12\",\"BUSCH LIGHT APPLE 15/25 AL CAN SHRINK\",\"BUSCH LIGHT APPLE 24/12 OZ CAN\",\"BUSCH LIGHT APPLE 48/12 AL CAN\",\"BUSCH LIGHT APPLE 24/16 OZ CAN 4/6\",\"BUSCH LIGHT APPLE 1/2 BBL SV\"]\n    ) {\n        retailers {\n            vpid\n            name\n            address\n            city\n            state\n            zipCode\n            latitude\n            longitude\n            distance\n        }\n    }\n}"
}
```

### Critical Implementation Notes:
1.  **CORS/Referer**: The API likely enforces `Referer: https://www.busch.com/` and `Origin` headers. Direct calls from a different domain browser will fail. **Must use a server-side proxy.**
2.  **Zip Code Strategy**: The API specifically requires a `zipCode`.
    -   *Logic:* Get User Lat/Long -> Call a reverse geocoding API (like Nominatim or Zippopotam.us) -> Get Zip Code -> Call Busch API.

---

## 4. Logic & Calculations

### Distance (Haversine Formula)
To ensure the compass remains accurate as the user moves:
```javascript
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // meters
}
```

### Bearing (Target Direction)
How many degrees clockwise from North the target is:
```javascript
function getBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // deg
}
```

---

## 5. UI/UX Specifications
-   **Theme**: Dark Mode with "Busch Apple" accents (Deep Red, Apple Green, Gold).
-   **Compass HUD**: 
    -   Centered rotating dial.
    -   A "North" indicator and a "Target" indicator.
    -   Rotation logic: `target_rotation = (bearing - browser_heading)`.
-   **Display**: Large font for distance (e.g., "750m").
-   **Feedback**: Pulsing animation when user is facing accurately within 5 degrees of the store.

---

## 6. Development Checklist
- [ ] Set up Next.js / React project.
- [ ] Implement Geolocation service hook.
- [ ] Build `/api/locate` proxy route.
- [ ] Implement reverse geocoding for Zip Code.
- [ ] Create Compass UI with SVG.
- [ ] Handle "No stores found" and "Permission denied" states.
- [ ] Polish with glassmorphism and animations.

---

## Concept Mockup
![Concept Mockup](file:///C:/Users/antho/.gemini/antigravity/brain/8df6aaa2-728e-4e35-bc8f-6b46608c699e/busch_apple_compass_mockup_1776716306251.png)
