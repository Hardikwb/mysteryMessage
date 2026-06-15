class configClass {
  MONGO_URI = process.env.MONGODB_URI;
  RESEND = process.env.RESEND_API_KEY;
  DOMAIN_NAME = process.env.DOMAIN_NAME;
  NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
  NODE_ENV = process.env.NODE_ENV;
  AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;
  GROQ_API_KEY = process.env.GROQ_API_KEY;
}

const config = new configClass();

export default config;
