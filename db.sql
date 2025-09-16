--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-07 10:25:08

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 967 (class 1247 OID 213118)
-- Name: commentaire_satisfaction_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.commentaire_satisfaction_enum AS ENUM (
    'decevant',
    'moyen',
    'bien',
    'tres_bien',
    'excellent'
);


ALTER TYPE public.commentaire_satisfaction_enum OWNER TO postgres;

--
-- TOC entry 919 (class 1247 OID 123142)
-- Name: personnel_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.personnel_role_enum AS ENUM (
    'accueil',
    'caissier',
    'cuisinier'
);


ALTER TYPE public.personnel_role_enum OWNER TO postgres;

--
-- TOC entry 931 (class 1247 OID 131270)
-- Name: personnel_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.personnel_status_enum AS ENUM (
    'attent',
    'accepter'
);


ALTER TYPE public.personnel_status_enum OWNER TO postgres;

--
-- TOC entry 889 (class 1247 OID 65660)
-- Name: table_event_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.table_event_type_enum AS ENUM (
    'ronde',
    'carree',
    'rectangle',
    'ovale'
);


ALTER TYPE public.table_event_type_enum OWNER TO postgres;

--
-- TOC entry 892 (class 1247 OID 123004)
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role_enum AS ENUM (
    'organisateur',
    'accueil',
    'caissier',
    'cuisinier'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

--
-- TOC entry 928 (class 1247 OID 123189)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'organisateur',
    'accueil',
    'caissier',
    'cuisinier'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 248 (class 1259 OID 180393)
-- Name: balance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.balance (
    id integer NOT NULL,
    total numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "eventId" integer NOT NULL
);


ALTER TABLE public.balance OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 180392)
-- Name: balance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.balance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.balance_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 247
-- Name: balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.balance_id_seq OWNED BY public.balance.id;


--
-- TOC entry 254 (class 1259 OID 196732)
-- Name: commentaire; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commentaire (
    id integer NOT NULL,
    contenu character varying NOT NULL,
    "userEmail" character varying NOT NULL,
    "userName" character varying,
    "userPhoto" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    satisfaction public.commentaire_satisfaction_enum DEFAULT 'decevant'::public.commentaire_satisfaction_enum NOT NULL
);


ALTER TABLE public.commentaire OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 196731)
-- Name: commentaire_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commentaire_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commentaire_id_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 253
-- Name: commentaire_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commentaire_id_seq OWNED BY public.commentaire.id;


--
-- TOC entry 223 (class 1259 OID 123042)
-- Name: evenement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evenement (
    id integer NOT NULL,
    nom character varying NOT NULL,
    type character varying NOT NULL,
    theme character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    date_fin timestamp without time zone,
    montanttransaction double precision,
    "createdAt" timestamp without time zone,
    "locationId" integer,
    "salleId" integer,
    utilisateur_id uuid NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.evenement OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 123041)
-- Name: evenement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evenement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evenement_id_seq OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 222
-- Name: evenement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evenement_id_seq OWNED BY public.evenement.id;


--
-- TOC entry 260 (class 1259 OID 229511)
-- Name: favorite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorite (
    id integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    note character varying,
    user_id uuid NOT NULL,
    evenement_id integer NOT NULL
);


ALTER TABLE public.favorite OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 229510)
-- Name: favorite_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorite_id_seq OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 259
-- Name: favorite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorite_id_seq OWNED BY public.favorite.id;


--
-- TOC entry 236 (class 1259 OID 139388)
-- Name: forfait; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forfait (
    id integer NOT NULL,
    nom character varying DEFAULT 'freemium'::character varying NOT NULL,
    price double precision DEFAULT '0'::double precision NOT NULL,
    maxevents integer,
    maxinvites integer,
    validationduration integer DEFAULT 1 NOT NULL,
    paypalplanid character varying
);


ALTER TABLE public.forfait OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 139387)
-- Name: forfait_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forfait_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forfait_id_seq OWNER TO postgres;

--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 235
-- Name: forfait_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forfait_id_seq OWNED BY public.forfait.id;


--
-- TOC entry 231 (class 1259 OID 123087)
-- Name: invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitation (
    id integer NOT NULL,
    "eventId" integer,
    status character varying DEFAULT 'ENVOYÉ'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invitation OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 123086)
-- Name: invitation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invitation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invitation_id_seq OWNER TO postgres;

--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 230
-- Name: invitation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invitation_id_seq OWNED BY public.invitation.id;


--
-- TOC entry 225 (class 1259 OID 123053)
-- Name: invite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invite (
    id integer NOT NULL,
    nom character varying NOT NULL,
    prenom character varying,
    email character varying NOT NULL,
    sex character varying NOT NULL,
    place integer,
    "qrCode" character varying,
    "eventId" integer,
    "tableId" integer,
    "ckeckedIn" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.invite OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 123052)
-- Name: invite_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invite_id_seq OWNER TO postgres;

--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 224
-- Name: invite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invite_id_seq OWNED BY public.invite.id;


--
-- TOC entry 220 (class 1259 OID 123024)
-- Name: localisation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.localisation (
    id integer NOT NULL,
    nom character varying NOT NULL
);


ALTER TABLE public.localisation OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 123023)
-- Name: localisation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.localisation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.localisation_id_seq OWNER TO postgres;

--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 219
-- Name: localisation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.localisation_id_seq OWNED BY public.localisation.id;


--
-- TOC entry 238 (class 1259 OID 180348)
-- Name: menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu (
    id integer NOT NULL,
    name character varying NOT NULL,
    "eventId" integer
);


ALTER TABLE public.menu OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 180347)
-- Name: menu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_id_seq OWNER TO postgres;

--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 237
-- Name: menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_id_seq OWNED BY public.menu.id;


--
-- TOC entry 240 (class 1259 OID 180357)
-- Name: menu_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_item (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    price numeric NOT NULL,
    category character varying NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    photo character varying,
    "menuId" integer
);


ALTER TABLE public.menu_item OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 180356)
-- Name: menu_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_item_id_seq OWNER TO postgres;

--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 239
-- Name: menu_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_item_id_seq OWNED BY public.menu_item.id;


--
-- TOC entry 258 (class 1259 OID 229500)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    title character varying NOT NULL,
    message character varying NOT NULL,
    type character varying DEFAULT 'info'::character varying NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 229499)
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_id_seq OWNER TO postgres;

--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 257
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- TOC entry 246 (class 1259 OID 180384)
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id integer NOT NULL,
    nom character varying,
    email character varying,
    "orderDate" timestamp without time zone NOT NULL,
    status character varying NOT NULL,
    "paymentStatus" character varying NOT NULL,
    total double precision NOT NULL,
    "tableId" integer,
    "eventId" integer,
    "inviteId" integer
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 180383)
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_id_seq OWNER TO postgres;

--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 245
-- Name: order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_id_seq OWNED BY public."order".id;


--
-- TOC entry 242 (class 1259 OID 180367)
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    id integer NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric NOT NULL,
    "orderId" integer,
    "menuItemId" integer
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 180366)
-- Name: order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_item_id_seq OWNER TO postgres;

--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 241
-- Name: order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_item_id_seq OWNED BY public.order_item.id;


--
-- TOC entry 244 (class 1259 OID 180376)
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    "eventId" integer NOT NULL,
    "paymentDate" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "personnelId" integer
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 180375)
-- Name: payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_id_seq OWNER TO postgres;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 243
-- Name: payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_id_seq OWNED BY public.payment.id;


--
-- TOC entry 233 (class 1259 OID 123150)
-- Name: personnel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personnel (
    id integer NOT NULL,
    nom character varying NOT NULL,
    email character varying NOT NULL,
    role public.personnel_role_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "evenementId" integer,
    status public.personnel_status_enum DEFAULT 'attent'::public.personnel_status_enum NOT NULL
);


ALTER TABLE public.personnel OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 123149)
-- Name: personnel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personnel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personnel_id_seq OWNER TO postgres;

--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 232
-- Name: personnel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personnel_id_seq OWNED BY public.personnel.id;


--
-- TOC entry 227 (class 1259 OID 123066)
-- Name: place; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place (
    id integer NOT NULL,
    number integer NOT NULL,
    reserved boolean DEFAULT false NOT NULL,
    "tableId" integer
);


ALTER TABLE public.place OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 123065)
-- Name: place_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.place_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.place_id_seq OWNER TO postgres;

--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 226
-- Name: place_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.place_id_seq OWNED BY public.place.id;


--
-- TOC entry 218 (class 1259 OID 123015)
-- Name: salle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salle (
    id integer NOT NULL,
    nom character varying NOT NULL,
    "locationId" integer
);


ALTER TABLE public.salle OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 123014)
-- Name: salle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salle_id_seq OWNER TO postgres;

--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 217
-- Name: salle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salle_id_seq OWNED BY public.salle.id;


--
-- TOC entry 256 (class 1259 OID 196742)
-- Name: satisfaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satisfaction (
    id integer NOT NULL,
    "isSatisfied" boolean DEFAULT false NOT NULL,
    "userEmail" character varying NOT NULL,
    "userName" character varying,
    "userPhoto" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.satisfaction OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 196741)
-- Name: satisfaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.satisfaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.satisfaction_id_seq OWNER TO postgres;

--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 255
-- Name: satisfaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.satisfaction_id_seq OWNED BY public.satisfaction.id;


--
-- TOC entry 250 (class 1259 OID 180402)
-- Name: short_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.short_link (
    id integer NOT NULL,
    slug character varying NOT NULL,
    "eventId" integer NOT NULL,
    "tableId" integer NOT NULL,
    "originalUrl" character varying NOT NULL
);


ALTER TABLE public.short_link OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 180401)
-- Name: short_link_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.short_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.short_link_id_seq OWNER TO postgres;

--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 249
-- Name: short_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.short_link_id_seq OWNED BY public.short_link.id;


--
-- TOC entry 252 (class 1259 OID 180411)
-- Name: system_prompt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_prompt (
    id integer NOT NULL,
    content text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_prompt OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 180410)
-- Name: system_prompt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_prompt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_prompt_id_seq OWNER TO postgres;

--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 251
-- Name: system_prompt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_prompt_id_seq OWNED BY public.system_prompt.id;


--
-- TOC entry 229 (class 1259 OID 123074)
-- Name: table_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.table_event (
    id integer NOT NULL,
    capacite integer NOT NULL,
    "placeReserve" integer DEFAULT 0 NOT NULL,
    type public.table_event_type_enum DEFAULT 'ronde'::public.table_event_type_enum NOT NULL,
    "position" jsonb,
    "eventId" integer,
    rotation double precision DEFAULT '0'::double precision NOT NULL,
    "qrCode" character varying,
    nom character varying,
    nombre integer
);


ALTER TABLE public.table_event OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 123073)
-- Name: table_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.table_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.table_event_id_seq OWNER TO postgres;

--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 228
-- Name: table_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.table_event_id_seq OWNED BY public.table_event.id;


--
-- TOC entry 221 (class 1259 OID 123032)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    email character varying NOT NULL,
    name character varying NOT NULL,
    photo character varying,
    role public.user_role_enum DEFAULT 'organisateur'::public.user_role_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    id character varying(255) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 123172)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    email character varying NOT NULL,
    name character varying NOT NULL,
    photo character varying,
    role public.users_role_enum DEFAULT 'organisateur'::public.users_role_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    id uuid NOT NULL,
    datedowngraded timestamp without time zone,
    forfait_id integer,
    forfaitexpirationdate timestamp without time zone,
    "isOnline" boolean DEFAULT false NOT NULL,
    "lastLogin" timestamp without time zone,
    "lastLogout" timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4801 (class 2604 OID 180396)
-- Name: balance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance ALTER COLUMN id SET DEFAULT nextval('public.balance_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 196735)
-- Name: commentaire id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commentaire ALTER COLUMN id SET DEFAULT nextval('public.commentaire_id_seq'::regclass);


--
-- TOC entry 4771 (class 2604 OID 123045)
-- Name: evenement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement ALTER COLUMN id SET DEFAULT nextval('public.evenement_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 229514)
-- Name: favorite id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite ALTER COLUMN id SET DEFAULT nextval('public.favorite_id_seq'::regclass);


--
-- TOC entry 4790 (class 2604 OID 139391)
-- Name: forfait id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forfait ALTER COLUMN id SET DEFAULT nextval('public.forfait_id_seq'::regclass);


--
-- TOC entry 4781 (class 2604 OID 123090)
-- Name: invitation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation ALTER COLUMN id SET DEFAULT nextval('public.invitation_id_seq'::regclass);


--
-- TOC entry 4773 (class 2604 OID 123056)
-- Name: invite id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite ALTER COLUMN id SET DEFAULT nextval('public.invite_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 123027)
-- Name: localisation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.localisation ALTER COLUMN id SET DEFAULT nextval('public.localisation_id_seq'::regclass);


--
-- TOC entry 4794 (class 2604 OID 180351)
-- Name: menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu ALTER COLUMN id SET DEFAULT nextval('public.menu_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 180360)
-- Name: menu_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item ALTER COLUMN id SET DEFAULT nextval('public.menu_item_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 229503)
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 180387)
-- Name: order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order" ALTER COLUMN id SET DEFAULT nextval('public.order_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 180370)
-- Name: order_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item ALTER COLUMN id SET DEFAULT nextval('public.order_item_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 180379)
-- Name: payment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment ALTER COLUMN id SET DEFAULT nextval('public.payment_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 123153)
-- Name: personnel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel ALTER COLUMN id SET DEFAULT nextval('public.personnel_id_seq'::regclass);


--
-- TOC entry 4775 (class 2604 OID 123069)
-- Name: place id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place ALTER COLUMN id SET DEFAULT nextval('public.place_id_seq'::regclass);


--
-- TOC entry 4767 (class 2604 OID 123018)
-- Name: salle id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salle ALTER COLUMN id SET DEFAULT nextval('public.salle_id_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 196745)
-- Name: satisfaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satisfaction ALTER COLUMN id SET DEFAULT nextval('public.satisfaction_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 180405)
-- Name: short_link id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.short_link ALTER COLUMN id SET DEFAULT nextval('public.short_link_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 180414)
-- Name: system_prompt id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_prompt ALTER COLUMN id SET DEFAULT nextval('public.system_prompt_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 123077)
-- Name: table_event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event ALTER COLUMN id SET DEFAULT nextval('public.table_event_id_seq'::regclass);


--
-- TOC entry 5076 (class 0 OID 180393)
-- Dependencies: 248
-- Data for Name: balance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.balance (id, total, "updatedAt", "eventId") FROM stdin;
\.


--
-- TOC entry 5082 (class 0 OID 196732)
-- Dependencies: 254
-- Data for Name: commentaire; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commentaire (id, contenu, "userEmail", "userName", "userPhoto", "createdAt", satisfaction) FROM stdin;
11	ny fampiasako ity platforme ity dia nanampy be ana t@ fikarakarana rehetra t@ lanona natoko ,nanamora ny zavatra natoko	andrea112samuel@gmail.com	samuel Andrea	https://lh3.googleusercontent.com/a/ACg8ocLnRlKYMCiZEig_5YUiVMZTTncaFQoEbnpIWV8etq_yQxNz12ZH=s96-c	2025-07-28 12:19:25.936239	bien
12	ssssssssssssssssssss	andrea112samuel@gmail.com	samuel Andrea	https://lh3.googleusercontent.com/a/ACg8ocLnRlKYMCiZEig_5YUiVMZTTncaFQoEbnpIWV8etq_yQxNz12ZH=s96-c	2025-07-28 12:45:07.641293	moyen
13	izao iany koa mahita fa ny fisian'ity plateforme iray ity dia manampy kokoa @ fikarakarana lanonana 	andyandybe243@gmail.com	Andyandy Be	https://lh3.googleusercontent.com/a/ACg8ocJ18ZNIbRw4Ok3mpc_nPAb8QB_-ooInMtoR_o6e4KWZGU-gfw=s96-c	2025-07-28 13:35:39.85214	tres_bien
14	Fa mila fahaizana tsara ny fampiasana azy mba ialana @ ny mety ho tsy fahatonombanana 	andyandybe243@gmail.com	Andyandy Be	https://lh3.googleusercontent.com/a/ACg8ocJ18ZNIbRw4Ok3mpc_nPAb8QB_-ooInMtoR_o6e4KWZGU-gfw=s96-c	2025-07-28 13:37:33.50248	decevant
15	ny fampiasako ity platforme ity dia nanampy be ana t@ fikarakarana rehetra	andrea112samuel@gmail.com	samuel Andrea	https://lh3.googleusercontent.com/a/ACg8ocLnRlKYMCiZEig_5YUiVMZTTncaFQoEbnpIWV8etq_yQxNz12ZH=s96-c	2025-07-31 08:01:46.149479	tres_bien
16	ny fampiasako ity platforme ity dia nanampy be ana t@ fikarakarana rehetra	andrea112samuel@gmail.com	samuel Andrea	https://lh3.googleusercontent.com/a/ACg8ocLnRlKYMCiZEig_5YUiVMZTTncaFQoEbnpIWV8etq_yQxNz12ZH=s96-c	2025-07-31 08:01:56.899862	excellent
\.


--
-- TOC entry 5051 (class 0 OID 123042)
-- Dependencies: 223
-- Data for Name: evenement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evenement (id, nom, type, theme, date, date_fin, montanttransaction, "createdAt", "locationId", "salleId", utilisateur_id, "isPublic") FROM stdin;
\.


--
-- TOC entry 5088 (class 0 OID 229511)
-- Dependencies: 260
-- Data for Name: favorite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorite (id, "createdAt", note, user_id, evenement_id) FROM stdin;
\.


--
-- TOC entry 5064 (class 0 OID 139388)
-- Dependencies: 236
-- Data for Name: forfait; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forfait (id, nom, price, maxevents, maxinvites, validationduration, paypalplanid) FROM stdin;
11	freemium	0	1	25	30	\N
12	starter	10	\N	100	180	P-08614512M4849171KNBXEYIY
13	pro	25.99	\N	500	180	P-5WS815537N4008138NBXE2KA
14	premium	39.99	\N	1000	180	P-18T33435JA8485137NBXE43A
15	gold	59.99	\N	\N	365	P-0HD43152W1205474MNBXFAYA
\.


--
-- TOC entry 5059 (class 0 OID 123087)
-- Dependencies: 231
-- Data for Name: invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitation (id, "eventId", status, "createdAt") FROM stdin;
\.


--
-- TOC entry 5053 (class 0 OID 123053)
-- Dependencies: 225
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invite (id, nom, prenom, email, sex, place, "qrCode", "eventId", "tableId", "ckeckedIn") FROM stdin;
\.


--
-- TOC entry 5048 (class 0 OID 123024)
-- Dependencies: 220
-- Data for Name: localisation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.localisation (id, nom) FROM stdin;
1	Ivato
\.


--
-- TOC entry 5066 (class 0 OID 180348)
-- Dependencies: 238
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu (id, name, "eventId") FROM stdin;
\.


--
-- TOC entry 5068 (class 0 OID 180357)
-- Dependencies: 240
-- Data for Name: menu_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_item (id, name, description, price, category, stock, photo, "menuId") FROM stdin;
\.


--
-- TOC entry 5086 (class 0 OID 229500)
-- Dependencies: 258
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, title, message, type, date) FROM stdin;
\.


--
-- TOC entry 5074 (class 0 OID 180384)
-- Dependencies: 246
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, nom, email, "orderDate", status, "paymentStatus", total, "tableId", "eventId", "inviteId") FROM stdin;
1	Client invité	nadjanick3@gmail.com	2025-07-31 13:39:16.441	served	unpaid	12	\N	\N	\N
2	Client invité	nadjanick3@gmail.com	2025-07-31 13:40:39.251	preparing	unpaid	24	\N	\N	\N
\.


--
-- TOC entry 5070 (class 0 OID 180367)
-- Dependencies: 242
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item (id, quantity, subtotal, "orderId", "menuItemId") FROM stdin;
\.


--
-- TOC entry 5072 (class 0 OID 180376)
-- Dependencies: 244
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment (id, "orderId", amount, "eventId", "paymentDate", "createdAt", "personnelId") FROM stdin;
\.


--
-- TOC entry 5061 (class 0 OID 123150)
-- Dependencies: 233
-- Data for Name: personnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnel (id, nom, email, role, "createdAt", "evenementId", status) FROM stdin;
\.


--
-- TOC entry 5055 (class 0 OID 123066)
-- Dependencies: 227
-- Data for Name: place; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place (id, number, reserved, "tableId") FROM stdin;
\.


--
-- TOC entry 5046 (class 0 OID 123015)
-- Dependencies: 218
-- Data for Name: salle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salle (id, nom, "locationId") FROM stdin;
1	espace 1	1
\.


--
-- TOC entry 5084 (class 0 OID 196742)
-- Dependencies: 256
-- Data for Name: satisfaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satisfaction (id, "isSatisfied", "userEmail", "userName", "userPhoto", "createdAt") FROM stdin;
\.


--
-- TOC entry 5078 (class 0 OID 180402)
-- Dependencies: 250
-- Data for Name: short_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.short_link (id, slug, "eventId", "tableId", "originalUrl") FROM stdin;
1	N7LdFo0l	41	70	https://api.mastertable.site/menus/event/41/table/70
2	S5TppLD1	41	71	https://api.mastertable.site/menus/event/41/table/71
3	-sbeacvk	42	72	https://api.mastertable.site/menus/event/42/table/72
4	zlIOFxmO	43	73	https://api.mastertable.site/menus/event/43/table/73
5	eOFxf0UF	44	74	https://api.mastertable.site/menus/event/44/table/74
6	eFTh7LnB	45	75	https://api.mastertable.site/menus/event/45/table/75
7	60KZbr44	44	76	https://api.mastertable.site/menus/event/44/table/76
8	929lgE_P	47	77	https://api.mastertable.site/menus/event/47/table/77
9	3XjBsZ-8	48	78	https://api.mastertable.site/menus/event/48/table/78
10	HjIGj7cu	50	79	https://api.mastertable.site/menus/event/50/table/79
11	9izQ-UuL	50	80	https://api.mastertable.site/menus/event/50/table/80
12	EbWF0uuG	50	81	https://api.mastertable.site/menus/event/50/table/81
13	RocGT4F0	50	82	https://api.mastertable.site/menus/event/50/table/82
14	ZxP9p5P7	50	83	https://api.mastertable.site/menus/event/50/table/83
15	MBc3sXP6	50	84	https://api.mastertable.site/menus/event/50/table/84
16	j-biD7Ax	50	85	https://api.mastertable.site/menus/event/50/table/85
17	V-PtVvBm	50	86	https://api.mastertable.site/menus/event/50/table/86
18	RtvDMeGV	50	87	https://api.mastertable.site/menus/event/50/table/87
19	gqFKIGCV	50	88	https://api.mastertable.site/menus/event/50/table/88
20	czYeThIa	50	89	https://api.mastertable.site/menus/event/50/table/89
21	I-rMwZMa	50	90	https://api.mastertable.site/menus/event/50/table/90
22	EQLButo0	50	91	https://api.mastertable.site/menus/event/50/table/91
23	61ju5vtH	50	92	https://api.mastertable.site/menus/event/50/table/92
24	HKpTODc8	50	93	https://api.mastertable.site/menus/event/50/table/93
25	pgOQjFem	50	94	https://api.mastertable.site/menus/event/50/table/94
26	HbvVrp7J	50	95	https://api.mastertable.site/menus/event/50/table/95
27	RGTZ1Ftf	51	96	https://api.mastertable.site/menus/event/51/table/96
28	sHZW27vw	52	97	https://api.mastertable.site/menus/event/52/table/97
29	t2iGEyfX	53	98	https://api.mastertable.site/menus/event/53/table/98
30	tl7VzY7E	54	99	https://api.mastertable.site/menus/event/54/table/99
31	OHi0jbya	58	100	https://api.mastertable.site/menus/event/58/table/100
32	yE2pGk7r	58	101	https://api.mastertable.site/menus/event/58/table/101
33	cRHu_91Z	58	102	https://api.mastertable.site/menus/event/58/table/102
34	d0Vhgeyh	59	103	https://api.mastertable.site/menus/event/59/table/103
35	38hMPM-M	59	104	https://api.mastertable.site/menus/event/59/table/104
36	QPZ2H1YT	59	105	https://api.mastertable.site/menus/event/59/table/105
37	QZGZPw6F	59	106	https://api.mastertable.site/menus/event/59/table/106
38	Gats80Ss	61	107	https://api.mastertable.site/menus/event/61/table/107
39	dqY17G1O	61	108	https://api.mastertable.site/menus/event/61/table/108
40	2L5Fe1WB	61	109	https://api.mastertable.site/menus/event/61/table/109
41	is4zfgOC	61	110	https://api.mastertable.site/menus/event/61/table/110
42	v2zwUQWI	61	111	https://api.mastertable.site/menus/event/61/table/111
43	BHuG5eet	61	112	https://api.mastertable.site/menus/event/61/table/112
44	FrpQJnj0	61	113	https://api.mastertable.site/menus/event/61/table/113
45	X6HBaj78	61	114	https://api.mastertable.site/menus/event/61/table/114
46	w2Y1eX-z	61	115	https://api.mastertable.site/menus/event/61/table/115
47	6X3UlkXO	61	116	https://api.mastertable.site/menus/event/61/table/116
48	bFzLAGVa	61	117	https://api.mastertable.site/menus/event/61/table/117
49	doz7O-bi	61	118	https://api.mastertable.site/menus/event/61/table/118
50	NrtIqifx	61	119	https://api.mastertable.site/menus/event/61/table/119
51	1XPJAKc4	61	120	https://api.mastertable.site/menus/event/61/table/120
52	jClc4Etb	61	121	https://api.mastertable.site/menus/event/61/table/121
53	Iovzfrtx	61	122	https://api.mastertable.site/menus/event/61/table/122
54	-aO1OTQG	61	123	https://api.mastertable.site/menus/event/61/table/123
55	5sXpH0C2	63	124	https://api.mastertable.site/menus/event/63/table/124
56	bG8VV8_n	63	125	https://api.mastertable.site/menus/event/63/table/125
57	EPbakcEr	64	126	https://api.mastertable.site/menus/event/64/table/126
58	92O13V3x	64	127	https://api.mastertable.site/menus/event/64/table/127
59	T-wLEF97	64	128	https://api.mastertable.site/menus/event/64/table/128
60	CpS9LOw0	64	129	https://api.mastertable.site/menus/event/64/table/129
61	7BvWyCeA	64	130	https://api.mastertable.site/menus/event/64/table/130
62	Ch6V348U	64	131	https://api.mastertable.site/menus/event/64/table/131
63	wQRdba7c	64	132	https://api.mastertable.site/menus/event/64/table/132
64	BytQnzIC	64	133	https://api.mastertable.site/menus/event/64/table/133
65	D260xn4y	64	134	https://api.mastertable.site/menus/event/64/table/134
66	AGRT_7On	64	135	https://api.mastertable.site/menus/event/64/table/135
67	aJqTY1jy	64	136	https://api.mastertable.site/menus/event/64/table/136
68	IF4UjLza	64	137	https://api.mastertable.site/menus/event/64/table/137
69	IHIZELMi	67	138	https://api.mastertable.site/menus/event/67/table/138
70	hsjplNnu	67	139	https://api.mastertable.site/menus/event/67/table/139
71	ADFixUQH	67	140	https://api.mastertable.site/menus/event/67/table/140
72	euibMm0m	67	141	https://api.mastertable.site/menus/event/67/table/141
73	e6WN3otQ	69	142	https://api.mastertable.site/menus/event/69/table/142
74	We3hFlsn	69	143	https://api.mastertable.site/menus/event/69/table/143
75	7GkzLD2u	69	144	https://api.mastertable.site/menus/event/69/table/144
76	Sl3U-HQ_	69	145	https://api.mastertable.site/menus/event/69/table/145
77	arv3kNQa	71	146	https://api.mastertable.site/menus/event/71/table/146
78	aTv_RIWm	71	147	https://api.mastertable.site/menus/event/71/table/147
79	U9HRdH7x	71	148	https://api.mastertable.site/menus/event/71/table/148
80	61qy19gO	71	149	https://api.mastertable.site/menus/event/71/table/149
81	--EgLugw	71	150	https://api.mastertable.site/menus/event/71/table/150
82	H1-QOxUJ	71	151	https://api.mastertable.site/menus/event/71/table/151
83	hprP5DsL	71	152	https://api.mastertable.site/menus/event/71/table/152
84	pX_coBfw	71	153	https://api.mastertable.site/menus/event/71/table/153
85	q2J8_F9V	71	154	https://api.mastertable.site/menus/event/71/table/154
86	c8FhInZ4	71	155	https://api.mastertable.site/menus/event/71/table/155
87	NgMYhywH	71	156	https://api.mastertable.site/menus/event/71/table/156
88	M3gO2GbX	71	157	https://api.mastertable.site/menus/event/71/table/157
89	OZ1SiXPz	71	158	https://api.mastertable.site/menus/event/71/table/158
90	lq-k_kYM	71	159	https://api.mastertable.site/menus/event/71/table/159
91	nzdHHmGq	71	160	https://api.mastertable.site/menus/event/71/table/160
92	U4Obd8q-	71	161	https://api.mastertable.site/menus/event/71/table/161
93	SVfaxrYJ	71	162	https://api.mastertable.site/menus/event/71/table/162
94	f4aC5KQp	72	163	https://api.mastertable.site/menus/event/72/table/163
95	1B0KjHVS	72	164	https://api.mastertable.site/menus/event/72/table/164
96	OPHvWe5F	72	165	https://api.mastertable.site/menus/event/72/table/165
97	0Rqhugfl	72	166	https://api.mastertable.site/menus/event/72/table/166
\.


--
-- TOC entry 5080 (class 0 OID 180411)
-- Dependencies: 252
-- Data for Name: system_prompt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_prompt (id, content, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5057 (class 0 OID 123074)
-- Dependencies: 229
-- Data for Name: table_event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.table_event (id, capacite, "placeReserve", type, "position", "eventId", rotation, "qrCode", nom, nombre) FROM stdin;
\.


--
-- TOC entry 5049 (class 0 OID 123032)
-- Dependencies: 221
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (email, name, photo, role, "createdAt", id) FROM stdin;
\.


--
-- TOC entry 5062 (class 0 OID 123172)
-- Dependencies: 234
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (email, name, photo, role, "createdAt", id, datedowngraded, forfait_id, forfaitexpirationdate, "isOnline", "lastLogin", "lastLogout") FROM stdin;
\.


--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 247
-- Name: balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.balance_id_seq', 1, false);


--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 253
-- Name: commentaire_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commentaire_id_seq', 16, true);


--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 222
-- Name: evenement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evenement_id_seq', 72, true);


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 259
-- Name: favorite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorite_id_seq', 1, false);


--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 235
-- Name: forfait_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.forfait_id_seq', 15, true);


--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 230
-- Name: invitation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invitation_id_seq', 39, true);


--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 224
-- Name: invite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invite_id_seq', 573, true);


--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 219
-- Name: localisation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.localisation_id_seq', 1, true);


--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 237
-- Name: menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_id_seq', 3, true);


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 239
-- Name: menu_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_item_id_seq', 3, true);


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 257
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_id_seq', 1, false);


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 245
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_id_seq', 2, true);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 241
-- Name: order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_item_id_seq', 2, true);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 243
-- Name: payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_id_seq', 1, false);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 232
-- Name: personnel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personnel_id_seq', 50, true);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 226
-- Name: place_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.place_id_seq', 1, false);


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 217
-- Name: salle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salle_id_seq', 1, true);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 255
-- Name: satisfaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.satisfaction_id_seq', 1, false);


--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 249
-- Name: short_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.short_link_id_seq', 97, true);


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 251
-- Name: system_prompt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_prompt_id_seq', 1, false);


--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 228
-- Name: table_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.table_event_id_seq', 166, true);


--
-- TOC entry 4867 (class 2606 OID 180421)
-- Name: system_prompt PK_0043ee96b9958af8b9a8b87e7b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_prompt
    ADD CONSTRAINT "PK_0043ee96b9958af8b9a8b87e7b4" PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 123083)
-- Name: table_event PK_069f2c75f548c6ccae9e1db9515; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event
    ADD CONSTRAINT "PK_069f2c75f548c6ccae9e1db9515" PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 180400)
-- Name: balance PK_079dddd31a81672e8143a649ca0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance
    ADD CONSTRAINT "PK_079dddd31a81672e8143a649ca0" PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 180391)
-- Name: order PK_1031171c13130102495201e3e20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY (id);


--
-- TOC entry 4823 (class 2606 OID 123031)
-- Name: localisation PK_296b44eea08ff6807f4430650dd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.localisation
    ADD CONSTRAINT "PK_296b44eea08ff6807f4430650dd" PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 123157)
-- Name: personnel PK_33a7253a5d2a326fec3cdc0baa5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT "PK_33a7253a5d2a326fec3cdc0baa5" PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 180355)
-- Name: menu PK_35b2a8f47d153ff7a41860cceeb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT "PK_35b2a8f47d153ff7a41860cceeb" PRIMARY KEY (id);


--
-- TOC entry 4875 (class 2606 OID 229519)
-- Name: favorite PK_495675cec4fb09666704e4f610f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite
    ADD CONSTRAINT "PK_495675cec4fb09666704e4f610f" PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 229509)
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- TOC entry 4855 (class 2606 OID 180365)
-- Name: menu_item PK_722c4de0accbbfafc77947a8556; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT "PK_722c4de0accbbfafc77947a8556" PRIMARY KEY (id);


--
-- TOC entry 4865 (class 2606 OID 180409)
-- Name: short_link PK_7908299b513d8842d9f473a2f49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.short_link
    ADD CONSTRAINT "PK_7908299b513d8842d9f473a2f49" PRIMARY KEY (id);


--
-- TOC entry 4851 (class 2606 OID 139398)
-- Name: forfait PK_8d43a883902f582183e4cea7da0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forfait
    ADD CONSTRAINT "PK_8d43a883902f582183e4cea7da0" PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 123072)
-- Name: place PK_96ab91d43aa89c5de1b59ee7cca; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT "PK_96ab91d43aa89c5de1b59ee7cca" PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 123187)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 4869 (class 2606 OID 196740)
-- Name: commentaire PK_a4fa195414f3428179d40988716; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commentaire
    ADD CONSTRAINT "PK_a4fa195414f3428179d40988716" PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 123094)
-- Name: invitation PK_beb994737756c0f18a1c1f8669c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY (id);


--
-- TOC entry 4825 (class 2606 OID 123164)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 4857 (class 2606 OID 180374)
-- Name: order_item PK_d01158fe15b1ead5c26fd7f4e90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 123049)
-- Name: evenement PK_e6d6a11dd36f18ddba5f48a98c0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "PK_e6d6a11dd36f18ddba5f48a98c0" PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 123022)
-- Name: salle PK_e85e090433d93f866a116d0c5b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salle
    ADD CONSTRAINT "PK_e85e090433d93f866a116d0c5b4" PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 196751)
-- Name: satisfaction PK_f4046a033e783cef3ef7b06b656; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satisfaction
    ADD CONSTRAINT "PK_f4046a033e783cef3ef7b06b656" PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 123060)
-- Name: invite PK_fc9fa190e5a3c5d80604a4f63e1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 180382)
-- Name: payment PK_fcaec7df5adf9cac408c686b2ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 123064)
-- Name: invite UQ_0e72cbbea2e7dd0dfc632db0516; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "UQ_0e72cbbea2e7dd0dfc632db0516" UNIQUE ("tableId", place);


--
-- TOC entry 4841 (class 2606 OID 213116)
-- Name: table_event UQ_10209ed58c015342c60b2160f98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event
    ADD CONSTRAINT "UQ_10209ed58c015342c60b2160f98" UNIQUE (nom, "eventId");


--
-- TOC entry 4847 (class 2606 OID 131196)
-- Name: personnel UQ_29cb88c110bcd6487decd42898a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT "UQ_29cb88c110bcd6487decd42898a" UNIQUE (email, "evenementId");


--
-- TOC entry 4835 (class 2606 OID 123062)
-- Name: invite UQ_300d383212d1fdbbf27bad69760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "UQ_300d383212d1fdbbf27bad69760" UNIQUE (email, "eventId");


--
-- TOC entry 4829 (class 2606 OID 123205)
-- Name: evenement UQ_8a374a510546b79458b118d3980; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "UQ_8a374a510546b79458b118d3980" UNIQUE (nom, utilisateur_id);


--
-- TOC entry 4898 (class 2606 OID 229540)
-- Name: favorite FK_006ee0b9806017b59db83721dd3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite
    ADD CONSTRAINT "FK_006ee0b9806017b59db83721dd3" FOREIGN KEY (evenement_id) REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4880 (class 2606 OID 123120)
-- Name: invite FK_025bc1c6cd8e811e08d7650fe98; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "FK_025bc1c6cd8e811e08d7650fe98" FOREIGN KEY ("tableId") REFERENCES public.table_event(id);


--
-- TOC entry 4877 (class 2606 OID 180477)
-- Name: evenement FK_165234bc9a7fb9336468be06ce3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "FK_165234bc9a7fb9336468be06ce3" FOREIGN KEY ("salleId") REFERENCES public.salle(id) ON DELETE CASCADE;


--
-- TOC entry 4894 (class 2606 OID 180467)
-- Name: order FK_18f0f231be36fb9407180ef11f5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_18f0f231be36fb9407180ef11f5" FOREIGN KEY ("inviteId") REFERENCES public.invite(id);


--
-- TOC entry 4884 (class 2606 OID 123135)
-- Name: invitation FK_4656a045a6ccee1814c98559806; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "FK_4656a045a6ccee1814c98559806" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4883 (class 2606 OID 123130)
-- Name: table_event FK_4c3fb8046e3766145113fd56359; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event
    ADD CONSTRAINT "FK_4c3fb8046e3766145113fd56359" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4882 (class 2606 OID 123125)
-- Name: place FK_598a9247c0a930b484fd7015285; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT "FK_598a9247c0a930b484fd7015285" FOREIGN KEY ("tableId") REFERENCES public.table_event(id) ON DELETE CASCADE;


--
-- TOC entry 4891 (class 2606 OID 221308)
-- Name: payment FK_5efcd28a0add38f9df2b0d3cadd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "FK_5efcd28a0add38f9df2b0d3cadd" FOREIGN KEY ("personnelId") REFERENCES public.personnel(id);


--
-- TOC entry 4885 (class 2606 OID 123158)
-- Name: personnel FK_615e5c83a52165c34a20fa54d5e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT "FK_615e5c83a52165c34a20fa54d5e" FOREIGN KEY ("evenementId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4889 (class 2606 OID 180432)
-- Name: order_item FK_646bf9ece6f45dbe41c203e06e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES public."order"(id);


--
-- TOC entry 4892 (class 2606 OID 180452)
-- Name: payment FK_7acc01aea1ff8f19abf62781770; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "FK_7acc01aea1ff8f19abf62781770" FOREIGN KEY ("eventId") REFERENCES public.evenement(id);


--
-- TOC entry 4897 (class 2606 OID 180472)
-- Name: balance FK_826252938f3f601090fc2a16e9f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance
    ADD CONSTRAINT "FK_826252938f3f601090fc2a16e9f" FOREIGN KEY ("eventId") REFERENCES public.evenement(id);


--
-- TOC entry 4886 (class 2606 OID 139399)
-- Name: users FK_8658110006b95fbe3117656e881; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_8658110006b95fbe3117656e881" FOREIGN KEY (forfait_id) REFERENCES public.forfait(id);


--
-- TOC entry 4878 (class 2606 OID 147579)
-- Name: evenement FK_907c1a3ba5234b81fcb83b4f013; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "FK_907c1a3ba5234b81fcb83b4f013" FOREIGN KEY (utilisateur_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4888 (class 2606 OID 188544)
-- Name: menu_item FK_a686871e76438259418aa5faceb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT "FK_a686871e76438259418aa5faceb" FOREIGN KEY ("menuId") REFERENCES public.menu(id) ON DELETE CASCADE;


--
-- TOC entry 4895 (class 2606 OID 229525)
-- Name: order FK_a9757413db9333d4bb21a2a42aa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_a9757413db9333d4bb21a2a42aa" FOREIGN KEY ("tableId") REFERENCES public.table_event(id) ON DELETE SET NULL;


--
-- TOC entry 4876 (class 2606 OID 123095)
-- Name: salle FK_ae58258d7e83717fa93153c9b28; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salle
    ADD CONSTRAINT "FK_ae58258d7e83717fa93153c9b28" FOREIGN KEY ("locationId") REFERENCES public.localisation(id);


--
-- TOC entry 4896 (class 2606 OID 229530)
-- Name: order FK_b76e4eedb99633c207ab48cdd3e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "FK_b76e4eedb99633c207ab48cdd3e" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE SET NULL;


--
-- TOC entry 4879 (class 2606 OID 123100)
-- Name: evenement FK_b88d4959aa2a26f5560b64fa75a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "FK_b88d4959aa2a26f5560b64fa75a" FOREIGN KEY ("locationId") REFERENCES public.localisation(id);


--
-- TOC entry 4890 (class 2606 OID 188549)
-- Name: order_item FK_caa901372ba1b5aa30d1950b458; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "FK_caa901372ba1b5aa30d1950b458" FOREIGN KEY ("menuItemId") REFERENCES public.menu_item(id) ON DELETE CASCADE;


--
-- TOC entry 4881 (class 2606 OID 123115)
-- Name: invite FK_cde6883963112e3ce027b1d7130; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "FK_cde6883963112e3ce027b1d7130" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4893 (class 2606 OID 229520)
-- Name: payment FK_d09d285fe1645cd2f0db811e293; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "FK_d09d285fe1645cd2f0db811e293" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON DELETE CASCADE;


--
-- TOC entry 4887 (class 2606 OID 188539)
-- Name: menu FK_e440f679827a8964ca892d5c4b0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT "FK_e440f679827a8964ca892d5c4b0" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4899 (class 2606 OID 229535)
-- Name: favorite FK_e666fc7cc4c80fba1944daa1a74; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite
    ADD CONSTRAINT "FK_e666fc7cc4c80fba1944daa1a74" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-08-07 10:25:09

--
-- PostgreSQL database dump complete
--

