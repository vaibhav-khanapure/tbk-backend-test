import type {HelmetOptions} from "helmet";

const helmetOptions: HelmetOptions = {
 contentSecurityPolicy: {
  directives: {
   defaultSrc: ["'self'"],
   scriptSrc: ["'self'", "'unsafe-inline'"],
   styleSrc: ["'self'", "'unsafe-inline'"],
   imgSrc: ["'self'", "data:", "https:"],
  },
 },
 crossOriginEmbedderPolicy: true,
 crossOriginOpenerPolicy: true,
 crossOriginResourcePolicy: true,
};

export default helmetOptions;