export function getDistanceBetweenPoints(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
  unit: string = 'km'
): number {
  // https://zh-tw.martech.zone/calculate-great-circle-distance/
  const theta: number = longitude1 - longitude2;
  const distance: number =
    60 *
    1.1515 *
    (180 / Math.PI) *
    Math.acos(
      Math.sin(latitude1 * (Math.PI / 180)) *
        Math.sin(latitude2 * (Math.PI / 180)) +
        Math.cos(latitude1 * (Math.PI / 180)) *
          Math.cos(latitude2 * (Math.PI / 180)) *
          Math.cos(theta * (Math.PI / 180))
    );
  if (unit === 'miles') {
    return distance;
    // return Math.round(distance, 2);
  } else if (unit === 'km') {
    return distance * 1.609344;
    // return Math.round(distance * 1.609344, 2);
  }
  return distance;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          reject(error);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

export function distanceCalculation(
  distance: number,
  speed = 40
): number | null {
  if (typeof distance !== 'number') return null;
  return distance / speed;
}

export function handleDistanceCalculation(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
  speed: number = 50
): number {
  const distance = getDistanceBetweenPoints(
    latitude1,
    longitude1,
    latitude2,
    longitude2
  );
  return distance / speed;
}

export async function handleCurrentCalculation(
  latitude2: number,
  longitude2: number,
  speed: number = 50
): Promise<number> {
  const position = await getCurrentPosition();
  const distance = getDistanceBetweenPoints(
    position.coords.latitude,
    position.coords.longitude,
    latitude2,
    longitude2
  );
  return distance / speed;
}
