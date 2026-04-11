-- Barblink — one cluster, one database per microservice.
-- Matches the 12 services in docs/05-tech-stack.md.

CREATE DATABASE barblink_auth;
CREATE DATABASE barblink_user;
CREATE DATABASE barblink_venue;
CREATE DATABASE barblink_discovery;
CREATE DATABASE barblink_social;
CREATE DATABASE barblink_checkin;
CREATE DATABASE barblink_chat;
CREATE DATABASE barblink_notification;
CREATE DATABASE barblink_scraper;
CREATE DATABASE barblink_dj;
CREATE DATABASE barblink_events;
CREATE DATABASE barblink_community;

-- Enable extensions on each service database.
\c barblink_auth;       CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_user;       CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_venue;      CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "postgis";
\c barblink_discovery;  CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "postgis";
\c barblink_social;     CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_checkin;    CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_chat;       CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_notification; CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_scraper;    CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_dj;         CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_events;     CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\c barblink_community;  CREATE EXTENSION IF NOT EXISTS "pgcrypto"; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
