// This file provides runtime configuration that can be set via environment variables
// It's loaded on the server and can be passed to the client

export const getServerRuntimeConfig = () => {
  return {
    // Server-side only configs (not exposed to client)
    pbAdminEmail: process.env.PB_ADMIN_EMAIL,
    pbAdminPassword: process.env.PB_ADMIN_PASSWORD,
  };
};

export const getPublicRuntimeConfig = () => {
  return {
    // Client-side accessible configs
    pocketbaseUrl:
      process.env.NEXT_PUBLIC_POCKETBASE_URL ||
      'http://127.0.0.1:8090',
    enableAddToCart: process.env.NEXT_PUBLIC_ENABLE_ADD_TO_CART,
  };
};
