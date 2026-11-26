import type { NextConfig } from "next";

const testPort = process.env.BOOKING_DEV_TEST_ORIGIN?.match(/^http:\/\/127\.0\.0\.1:(\d+)$/)?.[1];
const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  ...(process.env.BOOKING_LOCAL_PROMMT_TEST === "1" && { distDir: ".next/prommt-test" }),
  ...(testPort && { distDir: testPort === "3033" ? ".next/booking-test" : `.next/booking-test-${testPort}` }),
};

export default nextConfig;
