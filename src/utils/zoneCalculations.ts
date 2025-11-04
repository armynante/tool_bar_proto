export interface ZoneGeometry {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

/**
 * Calculate the position and size for a given zone ID
 * This matches the Windows 11 snap layout behavior
 */
export function calculateZoneGeometry(zoneId: string): ZoneGeometry | null {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const padding = 50;

  switch (zoneId) {
    case "half-left":
      return {
        position: { x: padding, y: padding },
        size: {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight - padding * 2,
        },
      };

    case "half-right":
      return {
        position: {
          x: screenWidth / 2 + padding / 2,
          y: padding,
        },
        size: {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight - padding * 2,
        },
      };

    case "quarter-tl":
      return {
        position: { x: padding, y: padding },
        size: {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        },
      };

    case "quarter-tr":
      return {
        position: {
          x: screenWidth / 2 + padding / 2,
          y: padding,
        },
        size: {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        },
      };

    case "quarter-bl":
      return {
        position: {
          x: padding,
          y: screenHeight / 2 + padding / 2,
        },
        size: {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        },
      };

    case "quarter-br":
      return {
        position: {
          x: screenWidth / 2 + padding / 2,
          y: screenHeight / 2 + padding / 2,
        },
        size: {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        },
      };

    case "third-left":
      return {
        position: { x: padding, y: padding },
        size: {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        },
      };

    case "third-center":
      return {
        position: {
          x: screenWidth / 3 + padding / 2,
          y: padding,
        },
        size: {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        },
      };

    case "third-right":
      return {
        position: {
          x: (screenWidth / 3) * 2 + padding / 2,
          y: padding,
        },
        size: {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        },
      };

    default:
      return null;
  }
}

