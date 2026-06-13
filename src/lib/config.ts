class configClass {
  MONGO_URI = process.env.MONGODB_URI;
  RESEND = process.env.RESEND_API_KEY;
  DOMAIN_NAME = process.env.DOMAIN_NAME;
}

const config = new configClass();

export default config;
