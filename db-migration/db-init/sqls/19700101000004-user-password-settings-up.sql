DROP TABLE if exists user_password_settings;

CREATE TABLE user_password_settings (
    protocol text,
    password text,
    "accessToken" text,
    provider text,
    identifier text,
    tokens json,
    "user" integer,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
ALTER TABLE public.user_password_settings OWNER TO avaea;

DROP SEQUENCE if exists user_password_settings_id_seq;

CREATE SEQUENCE user_password_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.user_password_settings_id_seq OWNER TO avaea;

ALTER SEQUENCE user_password_settings_id_seq OWNED BY user_password_settings.id;