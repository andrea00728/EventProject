--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-07 09:48:53

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
43	ando & Faly	mariage	rouge	2025-07-30 10:00:00	2025-07-30 17:00:00	\N	\N	1	1	a2eb8f34-da67-4143-b7c6-e49b0410beb4	f
71	wwww	mariage	classique	2025-08-03 11:15:00	2025-08-05 11:15:00	\N	\N	1	1	397565c8-7de4-48d0-b157-c68171a1c06b	f
72	spectacle	autre	classique	2025-08-27 12:24:00	2025-08-28 12:24:00	\N	\N	1	1	397565c8-7de4-48d0-b157-c68171a1c06b	t
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
39	71	ENVOYÉ	2025-08-01 13:43:16.531983
\.


--
-- TOC entry 5053 (class 0 OID 123053)
-- Dependencies: 225
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invite (id, nom, prenom, email, sex, place, "qrCode", "eventId", "tableId", "ckeckedIn") FROM stdin;
573	Randria	antsoa	nadjanick3@gmail.com	M	2	iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAAAklEQVR4AewaftIAAAdMSURBVO3BQY4cwRHAQLKw//8yrWOeGhj0rCyXM8L+YK1LHNa6yGGtixzWushhrYsc1rrIYa2LHNa6yGGtixzWushhrYsc1rrIYa2LHNa6yGGtixzWusgPL6n8TRVvqEwVk8qTik+oTBWTylTxCZWpYlKZKiaVqWJS+Zsq3jisdZHDWhc5rHWRH76s4ptUvqniDZUnFVPFpDJVvFExqUwVk8obFd+k8k2HtS5yWOsih7Uu8sMvU/lExSdUpoonKlPFVDGpTBWTyhsqTyo+UfGkYlJ5Q+UTFb/psNZFDmtd5LDWRX64jMpUMVVMKlPFE5Wp4o2KT6hMFZPKk4qp4iaHtS5yWOsih7Uu8sNlKiaVJxWTylTxhsoTlaliUnmiMlX8PzusdZHDWhc5rHWRH35Zxb+kYlKZKiaVJxWfqHijYlL5hMpU8UbFv+Sw1kUOa13ksNZFfvgylZtVTCpTxSdUpopvUpkqJpWp4onKv+yw1kUOa13ksNZF7A/+h6lMFb9JZap4Q2WqeKLypOKJypOK/2WHtS5yWOsih7UuYn/wgspUMal8U8UnVKaKSeVJxRsq31TxROVJxaQyVUwq31Txmw5rXeSw1kUOa13kh5cqflPFE5Wp4onKVDGpPFH5RMUnVKaKSWWqmCqeqHyiYlKZKv4lh7UucljrIoe1LmJ/8ILKVPGGyicqJpWpYlL5RMUnVKaKJypTxaQyVUwqU8Wk8k0Vk8o3VbxxWOsih7UucljrIvYHX6TyRsUnVD5R8UTlScWkMlVMKlPFE5U3KiaVT1RMKlPFv+yw1kUOa13ksNZFfvhlFZPKVPFEZap4UjGpTCpTxVTxhspU8YmKT6hMKp+oeEPlScUTlanijcNaFzmsdZHDWhexP3hB5UnFpPKk4onKk4pPqEwVk8pU8URlqphU/psq3lCZKv4lh7UucljrIoe1LvLDSxWTypOKSeWJylTxRGWqmFTeUJkqPlHxRGWqeKIyVUwqk8onKt5QmSomlanijcNaFzmsdZHDWhexP3hB5TdVfEJlqphUpopJ5UnFE5VPVEwqTyr+JSpTxROVqeKbDmtd5LDWRQ5rXeSHlyqeqEwVn1CZKiaVqWJSmSreUHlS8U0Vn1D5RMWk8qTiEypTxaQyVbxxWOsih7UucljrIvYHv0hlqphUnlR8QuUTFZPKVDGpTBVPVKaKSeWbKj6hMlW8oTJV/E2HtS5yWOsih7Uu8sNLKlPFN6lMFZ+omFSeVEwqT1SmiqliUpkqJpWp4onKpPKJiicqU8WTik+oTBVvHNa6yGGtixzWusgPX6YyVUwqU8UnVKaKJyqfUJkqJpWp4g2VJyqfqPimiknlExWTylTxTYe1LnJY6yKHtS7yw5dVPKn4hMobFZPKpPJNKlPFk4pPqDxReaNiUpkqnqhMKlPFbzqsdZHDWhc5rHWRH75M5UnFpDJVTBW/qWJSeVLxpGJSeaIyVXyi4ptUpopJZaqYKp6oTBXfdFjrIoe1LnJY6yI/vFQxqUwVk8oTlScVk8oTlW9SmSo+UTGpPFGZKt5QeaPim1SmijcOa13ksNZFDmtdxP7gv0jlScUbKlPFE5UnFf8SlaliUpkqJpUnFZPKVPEvOax1kcNaFzmsdRH7gxdUpopJZaqYVKaKSeWNikllqviEylTxRGWqmFTeqJhUflPFpPKJikllqnjjsNZFDmtd5LDWRewPXlD5RMWkMlU8UZkqJpWpYlL5myq+SeVJxSdUpopvUnlS8U2HtS5yWOsih7Uu8sOXVUwqk8pU8URlqphUpopJ5ZsqvknlExWTyhOVJxVvqEwVU8WkMqlMFW8c1rrIYa2LHNa6yA9/WcWkMlVMFb+pYlL5hMpU8YmKSWWqmFTeqPimikllqnhS8U2HtS5yWOsih7UuYn/wgspU8U0qU8Wk8k0Vn1B5UvGbVP4lFZPKVDGpTBVvHNa6yGGtixzWuoj9wf8wlaliUvmmiknlN1X8JpWp4hMqU8V/02GtixzWushhrYv88JLK31QxVXxTxROVT1R8QuUTKk8q3lCZKr5JZap447DWRQ5rXeSw1kV++LKKb1J5ojJVfKLiicobKlPFpPJEZaqYKp6ovFHxmyq+6bDWRQ5rXeSw1kV++GUqn6h4Q+UNlTcqPlExqUwVT1S+SeWbVKaK33RY6yKHtS5yWOsiP1ym4onKJyomlaniicpUMak8UXmj4g2VT6hMFU9Upoo3Dmtd5LDWRQ5rXeSH/3MqT1SeqHxCZar4JpVJZap4ojJVTCpTxROVv+mw1kUOa13ksNZFfvhlFb+pYlL5popJZap4ovJE5UnFJyqeqHyTypOKJyrfdFjrIoe1LnJY6yI/fJnK36TyTRVvqEwVk8qTikllqnii8qTiicqkMlU8UZlU/qbDWhc5rHWRw1oXsT9Y6xKHtS5yWOsih7UucljrIoe1LnJY6yKHtS5yWOsih7UucljrIoe1LnJY6yKHtS5yWOsih7Uu8h/Z+sZqLhlU6AAAAABJRU5ErkJggg==	71	146	f
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
3	resistance	71
\.


--
-- TOC entry 5068 (class 0 OID 180357)
-- Dependencies: 240
-- Data for Name: menu_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_item (id, name, description, price, category, stock, photo, "menuId") FROM stdin;
3	vary	vary maina	12	resistance	0	\N	3
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
1	1	12	1	3
2	2	24	2	3
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
50	skyrr	andyandybe243@gmail.com	cuisinier	2025-07-31 11:42:05.66281	71	accepter
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
1	N7LdFo0l	41	70	http://localhost:3000/menus/event/41/table/70
2	S5TppLD1	41	71	http://localhost:3000/menus/event/41/table/71
3	-sbeacvk	42	72	http://localhost:3000/menus/event/42/table/72
4	zlIOFxmO	43	73	http://localhost:3000/menus/event/43/table/73
5	eOFxf0UF	44	74	http://localhost:3000/menus/event/44/table/74
6	eFTh7LnB	45	75	http://localhost:3000/menus/event/45/table/75
7	60KZbr44	44	76	http://localhost:3000/menus/event/44/table/76
8	929lgE_P	47	77	http://localhost:3000/menus/event/47/table/77
9	3XjBsZ-8	48	78	http://localhost:3000/menus/event/48/table/78
10	HjIGj7cu	50	79	http://localhost:3000/menus/event/50/table/79
11	9izQ-UuL	50	80	http://localhost:3000/menus/event/50/table/80
12	EbWF0uuG	50	81	http://localhost:3000/menus/event/50/table/81
13	RocGT4F0	50	82	http://localhost:3000/menus/event/50/table/82
14	ZxP9p5P7	50	83	http://localhost:3000/menus/event/50/table/83
15	MBc3sXP6	50	84	http://localhost:3000/menus/event/50/table/84
16	j-biD7Ax	50	85	http://localhost:3000/menus/event/50/table/85
17	V-PtVvBm	50	86	http://localhost:3000/menus/event/50/table/86
18	RtvDMeGV	50	87	http://localhost:3000/menus/event/50/table/87
19	gqFKIGCV	50	88	http://localhost:3000/menus/event/50/table/88
20	czYeThIa	50	89	http://localhost:3000/menus/event/50/table/89
21	I-rMwZMa	50	90	http://localhost:3000/menus/event/50/table/90
22	EQLButo0	50	91	http://localhost:3000/menus/event/50/table/91
23	61ju5vtH	50	92	http://localhost:3000/menus/event/50/table/92
24	HKpTODc8	50	93	http://localhost:3000/menus/event/50/table/93
25	pgOQjFem	50	94	http://localhost:3000/menus/event/50/table/94
26	HbvVrp7J	50	95	http://localhost:3000/menus/event/50/table/95
27	RGTZ1Ftf	51	96	http://localhost:3000/menus/event/51/table/96
28	sHZW27vw	52	97	http://localhost:3000/menus/event/52/table/97
29	t2iGEyfX	53	98	http://localhost:3000/menus/event/53/table/98
30	tl7VzY7E	54	99	http://localhost:3000/menus/event/54/table/99
31	OHi0jbya	58	100	http://localhost:3000/menus/event/58/table/100
32	yE2pGk7r	58	101	http://localhost:3000/menus/event/58/table/101
33	cRHu_91Z	58	102	http://localhost:3000/menus/event/58/table/102
34	d0Vhgeyh	59	103	http://localhost:3000/menus/event/59/table/103
35	38hMPM-M	59	104	http://localhost:3000/menus/event/59/table/104
36	QPZ2H1YT	59	105	http://localhost:3000/menus/event/59/table/105
37	QZGZPw6F	59	106	http://localhost:3000/menus/event/59/table/106
38	Gats80Ss	61	107	http://localhost:3000/menus/event/61/table/107
39	dqY17G1O	61	108	http://localhost:3000/menus/event/61/table/108
40	2L5Fe1WB	61	109	http://localhost:3000/menus/event/61/table/109
41	is4zfgOC	61	110	http://localhost:3000/menus/event/61/table/110
42	v2zwUQWI	61	111	http://localhost:3000/menus/event/61/table/111
43	BHuG5eet	61	112	http://localhost:3000/menus/event/61/table/112
44	FrpQJnj0	61	113	http://localhost:3000/menus/event/61/table/113
45	X6HBaj78	61	114	http://localhost:3000/menus/event/61/table/114
46	w2Y1eX-z	61	115	http://localhost:3000/menus/event/61/table/115
47	6X3UlkXO	61	116	http://localhost:3000/menus/event/61/table/116
48	bFzLAGVa	61	117	http://localhost:3000/menus/event/61/table/117
49	doz7O-bi	61	118	http://localhost:3000/menus/event/61/table/118
50	NrtIqifx	61	119	http://localhost:3000/menus/event/61/table/119
51	1XPJAKc4	61	120	http://localhost:3000/menus/event/61/table/120
52	jClc4Etb	61	121	http://localhost:3000/menus/event/61/table/121
53	Iovzfrtx	61	122	http://localhost:3000/menus/event/61/table/122
54	-aO1OTQG	61	123	http://localhost:3000/menus/event/61/table/123
55	5sXpH0C2	63	124	http://localhost:3000/menus/event/63/table/124
56	bG8VV8_n	63	125	http://localhost:3000/menus/event/63/table/125
57	EPbakcEr	64	126	http://localhost:3000/menus/event/64/table/126
58	92O13V3x	64	127	http://localhost:3000/menus/event/64/table/127
59	T-wLEF97	64	128	http://localhost:3000/menus/event/64/table/128
60	CpS9LOw0	64	129	http://localhost:3000/menus/event/64/table/129
61	7BvWyCeA	64	130	http://localhost:3000/menus/event/64/table/130
62	Ch6V348U	64	131	http://localhost:3000/menus/event/64/table/131
63	wQRdba7c	64	132	http://localhost:3000/menus/event/64/table/132
64	BytQnzIC	64	133	http://localhost:3000/menus/event/64/table/133
65	D260xn4y	64	134	http://localhost:3000/menus/event/64/table/134
66	AGRT_7On	64	135	http://localhost:3000/menus/event/64/table/135
67	aJqTY1jy	64	136	http://localhost:3000/menus/event/64/table/136
68	IF4UjLza	64	137	http://localhost:3000/menus/event/64/table/137
69	IHIZELMi	67	138	http://localhost:3000/menus/event/67/table/138
70	hsjplNnu	67	139	http://localhost:3000/menus/event/67/table/139
71	ADFixUQH	67	140	http://localhost:3000/menus/event/67/table/140
72	euibMm0m	67	141	http://localhost:3000/menus/event/67/table/141
73	e6WN3otQ	69	142	http://localhost:3000/menus/event/69/table/142
74	We3hFlsn	69	143	http://localhost:3000/menus/event/69/table/143
75	7GkzLD2u	69	144	http://localhost:3000/menus/event/69/table/144
76	Sl3U-HQ_	69	145	http://localhost:3000/menus/event/69/table/145
77	arv3kNQa	71	146	http://localhost:3000/menus/event/71/table/146
78	aTv_RIWm	71	147	http://localhost:3000/menus/event/71/table/147
79	U9HRdH7x	71	148	http://localhost:3000/menus/event/71/table/148
80	61qy19gO	71	149	http://localhost:3000/menus/event/71/table/149
81	--EgLugw	71	150	http://localhost:3000/menus/event/71/table/150
82	H1-QOxUJ	71	151	http://localhost:3000/menus/event/71/table/151
83	hprP5DsL	71	152	http://localhost:3000/menus/event/71/table/152
84	pX_coBfw	71	153	http://localhost:3000/menus/event/71/table/153
85	q2J8_F9V	71	154	http://localhost:3000/menus/event/71/table/154
86	c8FhInZ4	71	155	http://localhost:3000/menus/event/71/table/155
87	NgMYhywH	71	156	http://localhost:3000/menus/event/71/table/156
88	M3gO2GbX	71	157	http://localhost:3000/menus/event/71/table/157
89	OZ1SiXPz	71	158	http://localhost:3000/menus/event/71/table/158
90	lq-k_kYM	71	159	http://localhost:3000/menus/event/71/table/159
91	nzdHHmGq	71	160	http://localhost:3000/menus/event/71/table/160
92	U4Obd8q-	71	161	http://localhost:3000/menus/event/71/table/161
93	SVfaxrYJ	71	162	http://localhost:3000/menus/event/71/table/162
94	f4aC5KQp	72	163	http://localhost:3000/menus/event/72/table/163
95	1B0KjHVS	72	164	http://localhost:3000/menus/event/72/table/164
96	OPHvWe5F	72	165	http://localhost:3000/menus/event/72/table/165
97	0Rqhugfl	72	166	http://localhost:3000/menus/event/72/table/166
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
146	4	1	ronde	{"top": 280, "left": 320}	71	0	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATTSURBVO3BQY4jRxAEwfAC//9l1xzzVECjk6OVNszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1LzTUAmNROQb1IzAflNat44qVp0UrXopGrRJ8vUbALyBJAbNU8AeULNE0CeULMJyKaTqkUnVYtOqhZ98mVAnlDzBJBJzQTkCTXfBGQTkCfUfNNJ1aKTqkUnVYs++csAmdTcAJnU3ACZ1Nyo+T85qVp0UrXopGrRJ38ZNZuATGomIH+Tk6pFJ1WLTqoWffJlav5NaiYgk5obNROQJ9TcAJnUPKHmT3JSteikatFJ1aJPlgH5kwCZ1ExAJjUTkEnNBOQGyKTmDSB/spOqRSdVi06qFn3ykpo/mZoJyKTmDTU3aiYgk5obNf8lJ1WLTqoWnVQtwh95AcikZgKySc0NkEnNBOQ3qbkBMqmZgGxS800nVYtOqhadVC3CH1kEZFJzA2RScwNkUvMEkBs1bwB5Qs0E5A01TwCZ1LxxUrXopGrRSdWiT14CMqm5ATKpuQFyA2RS801AJjU3am6APKFmAvKGmk0nVYtOqhadVC36ZBmQSc2kZgIyqZnUPAHkRs0E5AbIpGYCMqmZgLyhZgIyqXkCyKRm00nVopOqRSdVi/BHFgH5N6mZgExq3gDyhJobIJOaN4DcqPmmk6pFJ1WLTqoWffISkEnNBGRSMwGZ1NwAmdTcqJmAPKFmUjMBmdTcAJnUTEDeUDMBuQEyqXnjpGrRSdWik6pFn/zhgDwBZFIzqZmA3AC5UfOEmgnIpGYC8k1qNp1ULTqpWnRStQh/5AUgm9RsAjKpuQEyqfk3AZnUTEAmNTdAJjWbTqoWnVQtOqla9MkvUzMBuQFyo2YC8gSQSc0E5A01N0AmNZOaGzU3QCY133RSteikatFJ1aJPlql5Qs2NmgnIE2omIJOaGzU3QG6A3Ki5AfJNQCY1b5xULTqpWnRSteiTLwNyo2YC8gSQSc0EZFIzAZnU3AC5UfMEkBs1E5BJzQTkCTWbTqoWnVQtOqla9MmXqZmATEAmNW8AeULNDZAbNTdAJjU3aiYgk5oJyKTmBsikZtNJ1aKTqkUnVYs++WVqboDcqJmA3Kh5Q80E5AbIpOYJIDdAngByA2RS88ZJ1aKTqkUnVYvwR/7DgDyh5gbIjZoJyCY1TwDZpOaNk6pFJ1WLTqoWffISkN+kZlIzAfkmIDdqJiBvAJnUvKHmm06qFp1ULTqpWvTJMjWbgNwAmdRMQCYgk5obNTdAbtTcALlR84aaGyCTmjdOqhadVC06qVr0yZcBeULNG0DeUDMBmdRMaiYgk5ongLyhZgIyqZnUbDqpWnRSteikatEnfxk1N0AmNU+oeUPNG0BugNyoeeOkatFJ1aKTqkWf/M+omYBMQCY1k5obIJOaCciNmieAPKHmBsikZtNJ1aKTqkUnVYs++TI136TmCTUTkEnNE0AmNTdAnlAzAZnUTEAmNb/ppGrRSdWik6pFnywD8puA3KiZgExqNgGZ1ExqboBMap5QMwGZ1HzTSdWik6pFJ1WL8EeqlpxULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WL/gGqtEgeRknvwQAAAABJRU5ErkJggg==	s&A-1	\N
147	4	0	ronde	{"top": 80, "left": 400}	71	0	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATISURBVO3BQY4bSRAEwfAC//9lXx3zVECjkyPNIszwj1QtOaladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhZ98hKQn6RmAnKjZgLyhJoJyDepmYD8JDVvnFQtOqladFK16JNlajYBeQPIpOYJIJOaGyA3at5QswnIppOqRSdVi06qFn3yZUCeUPOEmhsgE5BJzQTkBsiNmgnIDZBJzRNAnlDzTSdVi06qFp1ULfrklwPyhJoJyKRmAvIEkEnNBGRS839yUrXopGrRSdWiT345NTdAJiBPqLkB8gaQSc1vdlK16KRq0UnVok++TM2/TM0NkEnNpOYGyDep+ZecVC06qVp0UrXok2VAfhKQSc2NmgnIpOYJIJOaGzUTkCeA/MtOqhadVC06qVqEf+QXA/KEmjeAfJOa3+ykatFJ1aKTqkWfvARkUjMBuVEzAXlCzQ2QGyCTmgnIjZoJyCYgk5obIJOaCciNmjdOqhadVC06qVr0yQ9TMwG5UTMBmYBMap5QMwGZ1ExAJiBvqJmA3AC5UXOjZgKy6aRq0UnVopOqRfhHXgDyN6mZgLyhZhOQSc0TQG7U3AC5UbPppGrRSdWik6pFnyxTMwGZ1NwAmdRMQG7UTEAmNTdAnlBzo+YGyKTmCSA3am6ATGreOKladFK16KRq0ScvqZmAbAIyqZmATGreUHMDZAJyo+YNNU8AmYBMaiY1m06qFp1ULTqpWoR/5AcBmdRMQCY1E5BJzRNAJjUTkL9JzQRkUvMGkBs1b5xULTqpWnRSteiTZUAmNU+omYDcALlRcwNkUjMBmdRMQCY1E5AngExqJiCTmgnI33RSteikatFJ1aJPXgLyTWomIJOaGyCTmhsgk5oJyBNq3gAyqZmATGpugExqNp1ULTqpWnRSteiTZWqeAPKEmhsgN0Bu1NyomYDcAJnU3ACZ1ExA/mUnVYtOqhadVC365CU1N0Bu1LwB5Ak1E5AJyKTmRs0EZFLzTWpugPykk6pFJ1WLTqoWffISkEnNJiA3am6A3Kh5AsiNmieAbAJyo+abTqoWnVQtOqla9MlLar5JzQTkb1JzA2RSc6NmAjIBeULNBOQnnVQtOqladFK16JNlQN4A8gaQSc0NkBs1N0BugHwTkH/JSdWik6pFJ1WL8I/8YkAmNROQGzUTkBs1E5BNap4AsknNGydVi06qFp1ULfrkJSA/Sc0Tat5Q84aaCcgTQCY1T6iZgExqNp1ULTqpWnRSteiTZWo2AXkDyKRmAjKpuQEyqbkB8oaaJ9T8TSdVi06qFp1ULfrky4A8oeYJNROQSc2Nmhsgk5obIJOaGyATkE1AJjXfdFK16KRq0UnVok9+OSA3QCY1bwCZ1NwAmdRMaiYgk5oJyA2QSc0NkEnNGydVi06qFp1ULfrkf0bNBGQCMqm5UXMD5EbNBGSTmgnI33RSteikatFJ1aJPvkzNN6m5UTMBuQHyhpo31HwTkEnNppOqRSdVi06qFn2yDMhPAjKp+SY1E5AbIJOaCcgTaiYgk5q/6aRq0UnVopOqRfhHqpacVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi/4DOLYaZ3S0nXIAAAAASUVORK5CYII=	s&A-2	\N
149	4	0	ronde	{"top": 120, "left": 160}	71	0	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATFSURBVO3BQY4cSRIEQdNA/f/Lun30UwCJ9CI5vSaCP1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0yUtA/iQ1N0CeUDMBuVFzA+QNNROQP0nNGydVi06qFp1ULfpkmZpNQJ5QMwG5ATKpuQFyo+YJIE+o2QRk00nVopOqRSdViz75MiBPqHkCyDcBuVHzBJBNQJ5Q800nVYtOqhadVC365JdRMwF5AsgTQG7U3Kj5TU6qFp1ULTqpWvTJLwNkUvM3Afl/clK16KRq0UnVok++TM2/BMg3qZnU3ACZ1Dyh5l9yUrXopGrRSdWiT5YB+ZvUTEAmNROQSc0EZFIzAbkBMql5A8i/7KRq0UnVopOqRfgj/2FAnlDzBJAbNU8AmdT8JidVi06qFp1ULfrkJSCTmgnIJjWTmgnIpGYCcqPmRs0E5EbNpGYCMqmZgGxS800nVYtOqhadVC3CH1kEZJOaCcgbam6ATGpugLyhZgLyhpongExq3jipWnRSteikatEnLwF5Qs0TQG7UTEBugExqboC8oeYGyBNqJiBvqNl0UrXopGrRSdWiT/4yIDdqJiATkEnNG2omIDdqboC8oWYCMql5AsikZtNJ1aKTqkUnVYvwR/4hQG7U3ACZ1GwC8oSaGyCTmjeA3Kj5ppOqRSdVi06qFn2yDMgmNZuAPKFmUjMBmdTcAJnUTEDeUDMBuQEyqXnjpGrRSdWik6pFn7wEZFIzAXkDyBNqJiCTmgnIDZBNaiYgk5oJyDep2XRSteikatFJ1aJPXlIzAblRMwGZ1NwA2aRmAjKpmYBMat5Q84SaCciNmgnIpGbTSdWik6pFJ1WL8EdeAHKj5g0gN2q+Ccgbam6ATGo2AZnUfNNJ1aKTqkUnVYs++cOATGomIJOaCcgbQG7UTGqeADIBuVFzA+SbgExq3jipWnRSteikahH+yAtAJjVPANmkZgIyqZmATGpugExq3gByo2YCMqmZgNyo+aaTqkUnVYtOqhZ98mVAJjWTmieATGreUHMDZFIzAZnUTEAmNTdqJiCTmgnIpOYGyKRm00nVopOqRSdViz75MjVvAJnUTEAmNZvUTEBugExqngByA+QJIDdAJjVvnFQtOqladFK1CH/kPwzIpOYGyKRmAnKj5gbIG2qeALJJzRsnVYtOqhadVC365CUgf5KaSc0NkBsgTwC5UTMBeQPIpOYNNd90UrXopGrRSdWiT5ap2QTkBsiNmgnIE2pugNyouQFyo+YNNTdAJjVvnFQtOqladFK16JMvA/KEmk1AJjVPAJnUTGomIJOaJ4C8oWYCMqmZ1Gw6qVp0UrXopGrRJ7+MmieA3Kh5Qs0bat4AcgPkRs0bJ1WLTqoWnVQt+uSXAfKEmgnIDZBJzQTkRs0TQJ5QcwNkUrPppGrRSdWik6pFn3yZmm9SMwGZ1ExAJiCTmieATGpugDyhZgIyqZmATGr+pJOqRSdVi06qFn2yDMifBOQGyKTmBsik5gkgk5pJzQ2QSc0TaiYgk5pvOqladFK16KRqEf5I1ZKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0f8AyuYoRIOOC0QAAAAASUVORK5CYII=	s&A-4	\N
151	6	0	rectangle	{"top": 320, "left": 480}	71	330	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAS0SURBVO3BQY4cSRIEQbVA/f/Lun30UwCJ9GpyuCYSf1C15FC16FC16FC16FC16FC16FC16FC16FC16FC16FC16FC16FC16FC16FC16FC16MNLSfhNKjdJ+CaVKQmbVKYk/CaVNw5Viw5Viw5Viz4sU9mUhCdUbpJwo3KThBuVJ5LwhMqmJGw6VC06VC06VC368GVJeELliSRMKlMSblSeUJmS8EQSNiXhCZVvOlQtOlQtOlQt+vCPScKkMiXhiSRMKpPKlIRJ5UblX3KoWnSoWnSoWvThH6MyJWFSmZIwqdwk4UZlSsL/k0PVokPVokPVog9fpvInqUxJmFS+SeUmCZPKEyp/k0PVokPVokPVog/LkvA3ScKkMiVhUrlRmZJwk4RJ5Y0k/M0OVYsOVYsOVYs+vKTyN0nCpLIpCZPKjcqUhEnlRuW/5FC16FC16FC1KP7ghSRMKlMSNqncJOEJlZskvKFyk4RJZUrCJpVvOlQtOlQtOlQt+vCSyhsqUxImlZskTCpTEiaVKQk3KlMSnkjCjcqUhDdUnkjCpPLGoWrRoWrRoWrRh5eScKNyk4RJZUrCjcqNyp+kcpOEJ1SmJLyhsulQtehQtehQtejDlyVhUplUblSeSMIbKm+oTEl4Q2VKwqTyRBImlU2HqkWHqkWHqkXxB1+UhEnlJgk3KpuSMKm8kYRJ5SYJk8obSbhR+aZD1aJD1aJD1aIPy5KwSWVKwo3KEypTEiaVJ1RukjCpTEl4Q2VKwk0SJpU3DlWLDlWLDlWLPnyZyhMqUxLeSMKkMiXhJglPqNyoTEmYVKYkfJPKpkPVokPVokPVoviDF5LwhsqmJEwqTyRhUpmSMKl8UxImlSkJk8pNEiaVTYeqRYeqRYeqRfEHf1ASnlB5Igk3KjdJeEPlJgmTyqYkTCrfdKhadKhadKhaFH/wQhImlTeSMKk8kYRJ5SYJk8obSXhC5SYJm1SmJEwqbxyqFh2qFh2qFn34ZUmYVG6S8ITKNyVhUplUnkjCjcqUhEllSsITKpsOVYsOVYsOVYs+/DKVKQmTyqYkvJGEN5IwqdyoTEmYVKYkTCo3SZhUNh2qFh2qFh2qFn34siTcqNwk4QmVTSpPJGFSeSIJN0l4Igk3SZhU3jhULTpULTpULYo/+A9LwqQyJeFGZUrCn6TyRBI2qbxxqFp0qFp0qFr04aUk/CaVSWVKwqTym1SmJLyRhEnlDZVvOlQtOlQtOlQt+rBMZVMSbpJwk4Q3VG6ScKNyk4QblTdUbpIwqbxxqFp0qFp0qFr04cuS8ITKN6lMSZhUpiRMKpPKlIRJ5YkkvKEyJWFSmVQ2HaoWHaoWHaoWffjHqUxJmFRuVJ5QeUPljSTcJOFG5Y1D1aJD1aJD1aIP/2dUpiRMKlMSblSmJNyoPJGEJ1RukjCpbDpULTpULTpULfrwZSrfpPKGypSEJ5Iwqdwk4QmVKQmTypSESeU3HaoWHaoWHaoWfViWhN+UhBuVN1SmJNwkYVKZVG6SMKk8oTIlYVL5pkPVokPVokPVoviDqiWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkWHqkX/A0VmOgXksECIAAAAAElFTkSuQmCC	W-1	\N
159	10	0	rectangle	{"top": 160, "left": 560}	71	0	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATaSURBVO3BQY4cSRIEQdNA/f/Lun30UwCJ9GpyOSaCP1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0yUtAfpOaGyCTmieATGpugGxSMwH5TWreOKladFK16KRq0SfL1GwC8oSaGyCTmieA3Kh5AsgTajYB2XRSteikatFJ1aJPvgzIE2qeAHKj5gbIpGYCMqmZgDwBZBOQJ9R800nVopOqRSdViz75j1EzAdkEZFJzo+ZfclK16KRq0UnVok/+MWpugExqJiA3QG7UTED+S06qFp1ULTqpWvTJl6n5TUAmNTdAJjU3QJ5QcwNkUvOEmr/JSdWik6pFJ1WLPlkG5E9SMwGZ1ExAboBMaiYgN0AmNW8A+ZudVC06qVp0UrXok5fU/M3UTEAmNW+ouVEzAZnU3Kj5f3JSteikatFJ1aJPXgIyqZmAbFIzqfmbAJnUTGomIJOaCcgmNd90UrXopGrRSdWiT36ZmgnIjZoJyKTmBsgNkBs1N0BugNyomYC8oeYJIJOaN06qFp1ULTqpWoQ/8gKQGzVvAJnUTEAmNZuAvKHmBsgTaiYgk5o/6aRq0UnVopOqRZ8sUzMBeULNpOZGzQTkCTWb1ExA3lAzAZnUPAFkUrPppGrRSdWik6pF+COLgExqboC8oeYNIJOaN4BMam6ATGreAHKj5ptOqhadVC06qVqEP/JFQCY1N0AmNROQJ9TcALlRswnIpGYC8oaaCcikZgIyqXnjpGrRSdWik6pFnywDMql5Qs0EZFIzAfkmIE+ouVEzAZnUTEC+Sc2mk6pFJ1WLTqoWfbJMzQTkDTVPqJmA3KiZgExqJiCTmjfUPKFmAnKjZgIyqdl0UrXopGrRSdUi/JEXgNyoeQPIpGYCcqNmAnKjZgLyhpobIJOaTUAmNd90UrXopGrRSdWiT5apmYDcqLlRMwGZ1ExANqm5AXID5EbNDZBvAjKpeeOkatFJ1aKTqkWf/DI1TwCZ1NyoeULNE0AmNW8AuVEzAZnUTECeULPppGrRSdWik6pFn/wyIDdqJjUTkCfUTGomIJOaCcgNkEnNBGRSc6NmAjKpmYBMam6ATGo2nVQtOqladFK16JMvU/MGkEnNBGRScwPkCTVPAJnUPAHkBsgTQG6ATGreOKladFK16KRq0ScvqfkmNd+kZgJyo2YCcgPkCTVPAJmA/EknVYtOqhadVC365CUgv0nNpOYGyKRmAvIEkBs1E5A3gExq3lDzTSdVi06qFp1ULfpkmZpNQG6ATGomNW+ouQFyo+YGyI2aN9TcAJnUvHFSteikatFJ1aJPvgzIE2o2AXlCzQRkUjOpmYBMap4A8oaaCcikZlKz6aRq0UnVopOqRZ/849RMQJ5Q84SaN9S8AeQGyI2aN06qFp1ULTqpWvTJPw7IpOYGyKRmAjKpmYDcqHkCyBNqboBMajadVC06qVp0UrXoky9T801qbtRMQG7UTEBugExqboA8oWYCMqmZgExqftNJ1aKTqkUnVYs+WQbkNwGZ1ExAJjU3QN4AMqmZ1NwAmdQ8oWYCMqn5ppOqRSdVi06qFuGPVC05qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFv0PrV9TE22bYUoAAAAASUVORK5CYII=	eee-1	\N
155	7	0	ronde	{"top": 320, "left": 160}	71	0	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATgSURBVO3BQY4jRxAEwfAC//9l1xzzVECjk6PVKszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1JzA2RSMwGZ1ExAJjU3QDapmYD8JjVvnFQtOqladFK16JNlajYBeULNJiBPqHkCyBNqNgHZdFK16KRq0UnVok++DMgTap4AcqPmCTU3QCY1TwDZBOQJNd90UrXopGrRSdWiT/7ngExqJiCTmhsgk5obNX+Tk6pFJ1WLTqoWffKXAzKpuQFyA+RGzQTk/+SkatFJ1aKTqkWffJmaPwmQJ9RMQCY1N2pugExqnlDzJzmpWnRSteikatEny4D8m9RMQCY1E5BJzQRkUjMBmdRMQCY1bwD5k51ULTqpWnRStQh/5D8MyI2aTUAmNU8AmdT8TU6qFp1ULTqpWoQ/8gKQSc0EZJOaJ4C8oeYJIJOaGyCTmgnIJjXfdFK16KRq0UnVok/+MGpugExqbtS8AWRSMwG5AXKjZgLyhpongExq3jipWnRSteikatEnX6ZmAnID5EbNBGRScwNkUvMEkEnNBGRScwPkCTUTkDfUbDqpWnRSteikahH+yBcBmdRMQG7UPAFkUvNNQCY1E5A31ExAJjVPAJnUbDqpWnRSteikahH+yCIgT6i5ATKpeQLIpGYCMqm5ATKpmYBMam6ATGreAHKj5ptOqhadVC06qVr0yUtAJjUTkDfUPAHkBsikZgIyqbkBMqm5ATKpmYC8oWYCcgNkUvPGSdWik6pFJ1WL8Ed+EZAbNROQSc0E5EbNBGSTmjeATGomIE+omYBMar7ppGrRSdWik6pFn3wZkCeATGomIJOaGyA3aiYgk5oJyCY1T6iZgNyomYBMajadVC06qVp0UrUIf+QXAZnUTEBu1ExAJjU3QG7UTEAmNROQGzU3QCY1m4BMar7ppGrRSdWik6pFn7wEZFLzBJBJzW9Sc6PmRs0EZAJyo+YGyDcBmdS8cVK16KRq0UnVok/+cEAmNU8AmdRMQCY1N0Bu1DwB5EbNBGRSMwF5Qs2mk6pFJ1WLTqoWffKHATKpmYBMam7UvAFkUvMEkEnNjZoJyKRmAjKpuQEyqdl0UrXopGrRSdWiT74MyKRmAjKpmYBMap4AMqmZ1NyomYBMaiYgk5ongNwAeQLIDZBJzRsnVYtOqhadVC3CH/kPA/KEmhsgN2omIJvUPAFkk5o3TqoWnVQtOqla9MlLQH6TmknNBOQJIE8AuVEzAXkDyKTmDTXfdFK16KRq0UnVok+WqdkE5AbIjZobNROQSc0NkBs1N0Bu1Lyh5gbIpOaNk6pFJ1WLTqoWffJlQJ5Q84aaJ4BMaiYgk5pJzQRkUvMEkDfUTEAmNZOaTSdVi06qFp1ULfrkLwPkDSCTmifUvKHmDSA3QG7UvHFSteikatFJ1aJP6hEgk5oJyI2aJ4A8oeYGyKRm00nVopOqRSdViz75MjXfpGYCMqmZgExqboDcAJnU3AB5Qs0EZFIzAZnU/KaTqkUnVYtOqhZ9sgzIbwIyqXkDyBtAJjWTmhsgk5on1ExAJjXfdFK16KRq0UnVIvyRqiUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVon8A+zpKMRY0BmgAAAAASUVORK5CYII=	ee-1	\N
164	8	0	carree	{"top": 280, "left": 440}	72	15	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATPSURBVO3BQY4jRxAEwfAC//9l1xzzVECjk6PVKszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1LzBpBJzQRkUjMB+SY1E5DfpOaNk6pFJ1WLTqoWfbJMzSYgTwCZ1NwAmdQ8oeYNIE+o2QRk00nVopOqRSdViz75MiBPqHkCyKTmRs0E5Ak1bwDZBOQJNd90UrXopGrRSdWiT/7n1NwAmdTcAJnU3Kj5m5xULTqpWnRSteiTegXIpGYC8n9yUrXopGrRSdWiT75MzZ8MyBNAnlBzA2RS84SaP8lJ1aKTqkUnVYs+WQbkTwJkUnOjZgIyqZmA3ACZ1LwB5E92UrXopGrRSdUi/JH/MCBPqJmATGq+Ccik5m9yUrXopGrRSdUi/JEXgExqJiCb1NwAuVHzBJBJzQ2QSc0NkEnNBGSTmm86qVp0UrXopGrRJ8uATGpugNyouQHyBpBJzQ2QJ4DcqJmAvKHmCSCTmjdOqhadVC06qVqEP/KLgHyTmjeATGomIJOaCcik5gbIE2omIJOaf9NJ1aKTqkUnVYs+eQnIpGYCcqPmCSCTmgnIpOYGyKRmAvKEmgnIG2omIJOaJ4BMajadVC06qVp0UrXoky9TMwF5Asik5kbNBGRS84SaCcgE5EbNDZBJzY2aGyA3ar7ppGrRSdWik6pFn7yk5g0gk5pJzQRkUrMJyKRmUvMGkEnNBOQNNROQGyCTmjdOqhadVC06qVr0yUtA3lAzAXkCyI2aCcikZgIyAblR84SaCcikZgLyTWo2nVQtOqladFK16JNlaiYgk5oJyKTmBshvUvNNap5QMwG5UTMBmdRsOqladFK16KRqEf7IIiA3am6A3KiZgGxSMwG5UTMBmdTcAJnUbAIyqfmmk6pFJ1WLTqoWffISkBs1E5BJzY2aJ9RsUjMBmYDcALlRcwPkm4BMat44qVp0UrXopGrRJ8vU3Ki5UTMBmdTcALlR801qngByo2YCMqmZgDyhZtNJ1aKTqkUnVYs++TIgN2omIJOaJ9RMQCYgN2omIDdqboBMam7UTEAmNROQSc0NkEnNppOqRSdVi06qFn3yZWomIE8AmdRMaiYgk5obIDdqJiATkBs1TwC5AfIEkBsgk5o3TqoWnVQtOqlahD/yHwZkUnMD5A01N0DeUPMEkE1q3jipWnRSteikatEnLwH5TWomNROQJ9RMQG6A3KiZgLwBZFLzhppvOqladFK16KRq0SfL1GwCcgNkUjMBeUPNDZAbNTdAbtS8oeYGyKTmjZOqRSdVi06qFn3yZUCeUPObgExqJiCTmknNBGRS8wSQN9RMQCY1k5pNJ1WLTqoWnVQt+uQvp+YJIJOaJ9S8oeYNIDdAbtS8cVK16KRq0UnVok/+MkAmNTdAJjUTkBs1E5AbNU8AeULNDZBJzaaTqkUnVYtOqhZ98mVqvknNG2omIE8AmdTcAHlCzQRkUjMBmdT8ppOqRSdVi06qFn2yDMhvAvKEmhs1N0BugExqJjU3QCY1T6iZgExqvumkatFJ1aKTqkX4I1VLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkX/AAzNPyoDgSNmAAAAAElFTkSuQmCC	W-2	\N
163	8	0	carree	{"top": 320, "left": 240}	72	330	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATSSURBVO3BQY4cSRIEQdNA/f/Lun30UwCJ9GpyuCaCP1K15KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVr0yUtAfpOaJ4BMam6ATGomIN+kZgLym9S8cVK16KRq0UnVok+WqdkE5A01N0A2qXkCyBNqNgHZdFK16KRq0UnVok++DMgTap4AsknNBGQTkE1AnlDzTSdVi06qFp1ULfrkH6PmBsg3AZnU3Kj5l5xULTqpWnRSteiTfwyQSc2kZgLyhJongPw/OaladFK16KRq0SdfpuY3qZmAvKFmAnKjZlJzA2RS84Sav8lJ1aKTqkUnVYs+WQbkb6ZmAnIDZFIzAbkBMql5A8jf7KRq0UnVopOqRfgj/2FAnlDzBJBJzRtAJjX/kpOqRSdVi06qFuGPvABkUjMB2aTmBsgTaiYgT6iZgExqboBMaiYgm9R800nVopOqRSdVi/BH/iAgN2omIDdqngAyqZmAfJOaCcgbap4AMql546Rq0UnVopOqRZ8sAzKpuVFzA+RGzQRkUvOGmgnIE2pugDyhZgLyhppNJ1WLTqoWnVQt+uTLgExqJiA3aiYgE5AbIJOaTWpugLyhZgIyqXkCyKRm00nVopOqRSdViz55CciNmgnIjZoJyKRmAjKpmYBMQCY1m4BMam6ATGpu1NwAuVHzTSdVi06qFp1ULfrkD1MzAZnUTEAmNU+ouQEyqZnUTEAmNTdAJjUTkDfUTEBugExq3jipWnRSteikahH+yCIgk5o3gGxSMwF5Q80bQCY1E5An1ExAJjXfdFK16KRq0UnVIvyRXwTkCTUTkEnNBGRSMwF5Qs0E5EbNJiCTmgnIpOYGyKRm00nVopOqRSdVi/BHFgF5Qs0E5Ak1N0CeUDMBeUPNDZBJzSYgk5pvOqladFK16KRq0ScvAblRMwGZgNyomYC8oeYJNU8AmYDcqLkB8k1AJjVvnFQtOqladFK16JNlajYBmdRMQCY1k5oJyKTmCSCTmknNE0Bu1ExAJjUTkCfUbDqpWnRSteikatEnfzk1bwB5A8ikZgIyqZmATGpu1ExAJjUTkEnNDZBJzaaTqkUnVYtOqhZ98oepmYBMQDapmYBMaiY1E5BJzQRkUvMEkBsgTwC5ATKpeeOkatFJ1aKTqkX4I/9hQG7UPAHkRs0EZJOaJ4BsUvPGSdWik6pFJ1WLPnkJyG9SM6m5AXKj5gkgN2omIG8AmdS8oeabTqoWnVQtOqla9MkyNZuA3ACZ1DwB5EbNDZAbNTdAbtS8oeYGyKTmjZOqRSdVi06qFn3yZUCeUPMGkCfU3ACZ1ExqJiCTmieAvKFmAjKpmdRsOqladFK16KRq0Sf/GDUTkEnNE2qeUPOGmjeA3AC5UfPGSdWik6pFJ1WLPvnHAHkCyKRmAnKjZgJyo+YJIE+ouQEyqdl0UrXopGrRSdWiT75MzTepmYBMam7U3KiZgExAJjU3QJ5QMwGZ1ExAJjW/6aRq0UnVopOqRZ8sA/KbgExqJiA3aiYgk5ongExqJjU3QCY1T6iZgExqvumkatFJ1aKTqkX4I1VLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkX/A4D7Rx9wcvZIAAAAAElFTkSuQmCC	W-1	\N
165	8	0	carree	{"top": 160, "left": 360}	72	0	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATGSURBVO3BQY4cSRIEQdNA/f/Lujz6KYBEejWbsyaCf6RqyUnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXok5eA/CQ1E5An1ExAJjVPANmkZgLyk9S8cVK16KRq0UnVok+WqdkE5Ak1E5AJyKTmJ6l5Q80mIJtOqhadVC06qVr0yZcBeULNE2omIE8AeUPNDZAbIJOaJ4A8oeabTqoWnVQtOqla9Mk/Dsik5gkgN2omIBOQGzUTkEnNf8lJ1aKTqkUnVYs++cepmYA8oeYJNROQN4BMav5lJ1WLTqoWnVQt+uTL1PxmQJ5Qc6NmAvJNan6Tk6pFJ1WLTqoWfbIMyE8CMqmZgExqJiCTmgnIJjUTkCeA/GYnVYtOqhadVC365CU1vwmQTWomIDdAboA8oeZfclK16KRq0UnVok9eAjKpmYDcqJmAPKFmAvIGkBs1N0A2AZnU3ACZ1ExAbtS8cVK16KRq0UnVIvwjPwjIE2pugExqJiCTmgnIpOYJIG+omYC8oeYJIJOaN06qFp1ULTqpWvTJS0A2qZmATGomNZuATGpu1NwAmdTcqJmA3Ki5AXKjZtNJ1aKTqkUnVYs+WaZmAvKGmhsgb6iZgDwBZFIzqbkBMql5AsiNmhsgk5o3TqoWnVQtOqlahH/kBSBPqJmAPKHmBsik5gbIpOYNIJOaGyCTmjeA3Kj5ppOqRSdVi06qFn3yZWqeULMJyI2aCciNmgnIDZA3gExqbtTcALlR88ZJ1aKTqkUnVYs+WabmCTU3QN5QMwGZgExqJiBPqJmAPAFkUjMBmdRMQP6mk6pFJ1WLTqoW4R/5IiCTmhsgk5obIJOaJ4DcqJmATGq+CcikZgIyqbkBMqnZdFK16KRq0UnVok+WAZnU3AC5AfIEkEnNjZon1ExAJjUTkEnNDZBJzQTkNzupWnRSteikatEny9RMQG7UTEAmNROQGzUTkBs1E5BJzY2aCcik5pvU3AD5SSdVi06qFp1ULfrkJSCTmknNG0Bu1ExAJjUTkBs1N0Bu1DwBZBOQGzXfdFK16KRq0UnVIvwjXwTkCTU3QCY1bwCZ1NwAeULNE0CeUHMDZFLzTSdVi06qFp1ULfpkGZAn1ExAbtRMQCY1E5BJzQ2QSc0bQL4JyG9yUrXopGrRSdUi/CP/MCA3aiYgv5maJ4BsUvPGSdWik6pFJ1WLPnkJyE9Sc6NmAjKpmYDcqLkBcqNmAvIEkEnNE2omIJOaTSdVi06qFp1ULfpkmZpNQN5QMwG5UXMDZFJzA+QNNU+o+ZtOqhadVC06qVr0yZcBeULNE2pugLwBZFJzA2RScwNkArIJyKTmm06qFp1ULTqpWvTJPw7IE2reADKpuQEyqZnUTEAmNROQGyCTmhsgk5o3TqoWnVQtOqla9Mn/GSCTmifUTEBu1ExANqmZgPxNJ1WLTqoWnVQt+uTL1HyTmhsgN0CeAHKj5g013wRkUrPppGrRSdWik6pFnywD8pOAvKHmBsikZgJyA2RSMwF5Qs0EZFLzN51ULTqpWnRStQj/SNWSk6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatH/AJI5Hlf2jUgsAAAAAElFTkSuQmCC	W-3	\N
166	8	0	carree	{"top": 120, "left": 200}	72	0	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATgSURBVO3BQY4bSRAEwfAC//9l3znmqYBGJ2clIczwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1JzA+QJNTdAbtRMQJ5QcwPkN6l546Rq0UnVopOqRZ8sU7MJyCY1E5DfpGYCMqm5UbMJyKaTqkUnVYtOqhZ98mVAnlCzSc0EZFJzA2RS84SaCcgmIE+o+aaTqkUnVYtOqhZ98o9R8wSQSc0NkBs1E5BJzb/spGrRSdWik6pFn/xjgExqngDym4BMav5mJ1WLTqoWnVQt+uTL1HwTkEnNBGRS8waQSc0TQCY1b6j5k5xULTqpWnRSteiTZUD+JkAmNROQSc0EZFJzo2YCMqm5AfInO6ladFK16KRqEf7IPwzIpOYNIJvU/EtOqhadVC06qVr0yUtAJjU3QCY1E5AbNROQSc2kZgLyTWqeAHKjZgIyqfmTnFQtOqladFK1CH/ki4BMaiYgk5o3gExqJiCTmjeATGreAHKj5gbIpOYGyKTmjZOqRSdVi06qFuGPLAJyo+YGyI2aCcik5gkgN2pugNyomYBMam6ATGomIG+o2XRSteikatFJ1SL8kReAPKHmm4BMap4A8oSaTUAmNROQTWo2nVQtOqladFK16JOX1ExAJjVvAJnUTEDeADKpmYBMam6ATGreADKpuQEyqZmATEAmNW+cVC06qVp0UrXok18G5EbNpGYCMqm5AfIEkEnNG0Bu1NyoeULNBGRS800nVYtOqhadVC365CUgk5oJyKRmAnIDZFJzA2RSMwF5AsikZgJyo+YGyBtAJjU3QG7UvHFSteikatFJ1SL8kReA3Kh5Asik5g0gN2o2AXlCzQ2QGzUTkEnNBGRSs+mkatFJ1aKTqkWfvKRmAvIEkBsgN2omIJOaJ4BMam6A3KiZgNwAmdT8TU6qFp1ULTqpWoQ/sgjIjZoJyI2aCciNmhsgk5oJyCY1N0AmNROQGzVvAJnUvHFSteikatFJ1aJPXgIyqZmAvAFkUvOGmgnIpGYCMqmZgExqnlCzCcikZgLyTSdVi06qFp1ULcIf+R8BmdTcALlRMwGZ1DwB5A01N0AmNTdAJjVPALlR88ZJ1aKTqkUnVYvwR14AMqm5AfKGmhsgN2omIJOa3wRkk5oJyKTmm06qFp1ULTqpWvTJS2qeULMJyKRmE5BJzTepeQLIE0Bu1LxxUrXopGrRSdWiT14C8pvUTGpugNyouVFzA2RSMwGZ1DwBZFLzhJoJyKRm00nVopOqRSdViz5ZpmYTkBsgT6h5Asik5g0gT6h5A8ikZgIyqXnjpGrRSdWik6pFn3wZkCfUPKFmAnID5EbNpGYCcgNkUnMDZAKySc0E5JtOqhadVC06qVr0yV8OyBtqnlAzAbkBMqm5UTMBeQLIE2o2nVQtOqladFK16JO/nJoJyKRmAjIBeULNjZoJyBNAJjU3QCY1TwCZ1LxxUrXopGrRSdWiT75MzW9S84SaJ4DcAHlDzTcBmdRsOqladFK16KRq0SfLgPwmIJOaJ4BMam7UTEBu1ExA3gAyqZmATGp+00nVopOqRSdVi/BHqpacVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi/4D+u1IM9+dOpIAAAAASUVORK5CYII=	W-4	\N
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
andyandybe243@gmail.com	Andyandy Be	https://lh3.googleusercontent.com/a/ACg8ocJ18ZNIbRw4Ok3mpc_nPAb8QB_-ooInMtoR_o6e4KWZGU-gfw=s96-c	cuisinier	2025-07-21 22:24:03.777818	a2eb8f34-da67-4143-b7c6-e49b0410beb4	\N	11	\N	f	2025-07-31 14:35:46.207	2025-07-31 14:49:22.494
andrea112samuel@gmail.com	samuel Andrea	https://lh3.googleusercontent.com/a/ACg8ocLnRlKYMCiZEig_5YUiVMZTTncaFQoEbnpIWV8etq_yQxNz12ZH=s96-c	organisateur	2025-07-21 22:26:50.033016	397565c8-7de4-48d0-b157-c68171a1c06b	\N	13	2026-01-17 22:31:34.403	t	2025-08-07 08:40:54.283	2025-07-31 13:38:12.404
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


-- Completed on 2025-08-07 09:48:55

--
-- PostgreSQL database dump complete
--

