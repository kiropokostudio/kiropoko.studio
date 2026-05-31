const defaultGaMeasurementId = "G-Z877TCJJ93";

export const analyticsHostname = "kiropoko.studio";
export const gaMeasurementId =
  process.env.NODE_ENV === "development" ? "" : process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || defaultGaMeasurementId;
