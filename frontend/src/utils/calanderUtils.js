// CalanderUtils.js
export const hexToRgba = (hex, alpha = 1) => {
    if (!hex || typeof hex !== "string") {
        console.error("Invalid hex value:", hex);
        return "rgba(0, 0, 0, 1)";
    }
    hex = hex.replace(/^#/, "");

    let bigint;
    if (hex.length === 3) {
        bigint = parseInt(
            hex
                .split("")
                .map((char) => char + char)
                .join(""),
            16
        );
    } else if (hex.length === 6) {
        bigint = parseInt(hex, 16);
    } else {
        console.error("Invalid hex length:", hex);
        return "rgba(0, 0, 0, 1)";
    }

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};