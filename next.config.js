/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async redirects() {
    return [
      { source: "/leads", destination: "/admin/sales/leads", permanent: false },
      { source: "/leads/:id", destination: "/admin/sales/leads/:id", permanent: false },
      { source: "/pipeline", destination: "/admin/sales/pipeline", permanent: false },
      { source: "/activity", destination: "/admin/sales/activity", permanent: false },
      { source: "/analytics", destination: "/admin/sales/analytics", permanent: false },
      { source: "/settings", destination: "/admin/sales/settings", permanent: false },
      { source: "/employees", destination: "/admin/employees", permanent: false },
    ];
  },
};

module.exports = nextConfig;
