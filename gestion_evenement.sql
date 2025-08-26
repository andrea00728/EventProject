--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-14 08:33:59

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
-- TOC entry 895 (class 1247 OID 123142)
-- Name: personnel_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.personnel_role_enum AS ENUM (
    'accueil',
    'caissier',
    'cuisinier'
);


ALTER TYPE public.personnel_role_enum OWNER TO postgres;

--
-- TOC entry 907 (class 1247 OID 131270)
-- Name: personnel_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.personnel_status_enum AS ENUM (
    'attent',
    'accepter'
);


ALTER TYPE public.personnel_status_enum OWNER TO postgres;

--
-- TOC entry 865 (class 1247 OID 65660)
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
-- TOC entry 868 (class 1247 OID 123004)
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
-- TOC entry 904 (class 1247 OID 123189)
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
    utilisateur_id uuid NOT NULL
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
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 222
-- Name: evenement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evenement_id_seq OWNED BY public.evenement.id;


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
-- TOC entry 4940 (class 0 OID 0)
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
    "templateType" character varying NOT NULL,
    design character varying NOT NULL,
    status character varying NOT NULL,
    "eventId" integer
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
-- TOC entry 4941 (class 0 OID 0)
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
    prenom character varying NOT NULL,
    email character varying NOT NULL,
    sex character varying NOT NULL,
    place integer,
    "qrCode" character varying,
    "eventId" integer,
    "tableId" integer
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
-- TOC entry 4942 (class 0 OID 0)
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
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 219
-- Name: localisation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.localisation_id_seq OWNED BY public.localisation.id;


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
    status public.personnel_status_enum DEFAULT 'attent'::public.personnel_status_enum NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
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
-- TOC entry 4944 (class 0 OID 0)
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
-- TOC entry 4945 (class 0 OID 0)
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
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 217
-- Name: salle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salle_id_seq OWNED BY public.salle.id;


--
-- TOC entry 229 (class 1259 OID 123074)
-- Name: table_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.table_event (
    id integer NOT NULL,
    numero integer NOT NULL,
    capacite integer NOT NULL,
    "placeReserve" integer DEFAULT 0 NOT NULL,
    type public.table_event_type_enum DEFAULT 'ronde'::public.table_event_type_enum NOT NULL,
    "position" jsonb,
    "eventId" integer
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
-- TOC entry 4947 (class 0 OID 0)
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
    forfaitexpirationdate timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4708 (class 2604 OID 123045)
-- Name: evenement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement ALTER COLUMN id SET DEFAULT nextval('public.evenement_id_seq'::regclass);


--
-- TOC entry 4722 (class 2604 OID 139391)
-- Name: forfait id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forfait ALTER COLUMN id SET DEFAULT nextval('public.forfait_id_seq'::regclass);


--
-- TOC entry 4715 (class 2604 OID 123090)
-- Name: invitation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation ALTER COLUMN id SET DEFAULT nextval('public.invitation_id_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 123056)
-- Name: invite id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite ALTER COLUMN id SET DEFAULT nextval('public.invite_id_seq'::regclass);


--
-- TOC entry 4705 (class 2604 OID 123027)
-- Name: localisation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.localisation ALTER COLUMN id SET DEFAULT nextval('public.localisation_id_seq'::regclass);


--
-- TOC entry 4716 (class 2604 OID 123153)
-- Name: personnel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel ALTER COLUMN id SET DEFAULT nextval('public.personnel_id_seq'::regclass);


--
-- TOC entry 4710 (class 2604 OID 123069)
-- Name: place id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place ALTER COLUMN id SET DEFAULT nextval('public.place_id_seq'::regclass);


--
-- TOC entry 4704 (class 2604 OID 123018)
-- Name: salle id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salle ALTER COLUMN id SET DEFAULT nextval('public.salle_id_seq'::regclass);


--
-- TOC entry 4712 (class 2604 OID 123077)
-- Name: table_event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event ALTER COLUMN id SET DEFAULT nextval('public.table_event_id_seq'::regclass);


--
-- TOC entry 4920 (class 0 OID 123042)
-- Dependencies: 223
-- Data for Name: evenement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evenement (id, nom, type, theme, date, date_fin, montanttransaction, "createdAt", "locationId", "salleId", utilisateur_id) FROM stdin;
31	andrea & blabla	mariage	rouge	2025-07-14 10:00:00	2025-07-14 16:00:00	\N	\N	1	1	6c3a56e6-3256-4c58-89c1-57888d2cd8b6
32	gg	anniversaire	rouge	2025-07-17 10:00:00	2025-07-17 17:00:00	\N	\N	1	1	6c3a56e6-3256-4c58-89c1-57888d2cd8b6
\.


--
-- TOC entry 4933 (class 0 OID 139388)
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
-- TOC entry 4928 (class 0 OID 123087)
-- Dependencies: 231
-- Data for Name: invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitation (id, "templateType", design, status, "eventId") FROM stdin;
\.


--
-- TOC entry 4922 (class 0 OID 123053)
-- Dependencies: 225
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invite (id, nom, prenom, email, sex, place, "qrCode", "eventId", "tableId") FROM stdin;
495	Randria	seheno	randria@gmail.com	M	1	\N	31	50
496	yyyy	yyyy	yyy@gmail.com	M	1	\N	32	54
497	Martin	Lucas	lucas.martin@example.com	M	2	\N	31	50
498	Dupont	Emma	emma.dupont@example.com	F	3	\N	31	50
499	Lefevre	Thomas	thomas.lefevre@example.com	M	4	\N	31	50
500	Moreau	Sophie	sophie.moreau@example.com	F	5	\N	31	50
501	Girard	Antoine	antoine.girard@example.com	M	6	\N	31	50
502	Roux	Chloé	chloe.roux@example.com	F	7	\N	31	50
503	Fournier	Hugo	hugo.fournier@example.com	M	1	\N	31	51
504	Chevalier	Léa	lea.chevalier@example.com	F	2	\N	31	51
505	Blanc	Mathieu	mathieu.blanc@example.com	M	3	\N	31	51
506	Guerin	Manon	manon.guerin@example.com	F	4	\N	31	51
507	Lemoine	Julien	julien.lemoine@example.com	M	5	\N	31	51
508	Caron	Julie	julie.caron@example.com	F	1	\N	31	52
509	Durand	Maxime	maxime.durand@example.com	M	2	\N	31	52
510	Perrin	Clara	clara.perrin@example.com	F	3	\N	31	52
511	Robin	Nathan	nathan.robin@example.com	M	4	\N	31	52
512	Lopez	Zoé	zoe.lopez@example.com	F	1	\N	31	53
513	Vidal	Alexandre	alexandre.vidal@example.com	M	2	\N	31	53
514	Henry	Louise	louise.henry@example.com	F	3	\N	31	53
515	Marchand	Victor	victor.marchand@example.com	M	4	\N	31	53
516	Gautier	Luna	luna.gautier@example.com	F	5	\N	31	53
517	Barbier	Arthur	arthur.barbier@example.com	M	\N	\N	31	\N
518	Lacroix	Maëlle	maelle.lacroix@example.com	F	\N	\N	31	\N
519	Rey	Adrien	adrien.rey@example.com	M	\N	\N	31	\N
520	Faure	Alice	alice.faure@example.com	F	\N	\N	31	\N
521	Bailly	Léo	leo.bailly@example.com	M	\N	\N	31	\N
522	Dumas	Inès	ines.dumas@example.com	F	\N	\N	31	\N
523	Clement	Gabriel	gabriel.clement@example.com	M	\N	\N	31	\N
524	Bertrand	Lila	lila.bertrand@example.com	F	\N	\N	31	\N
525	Simon	Quentin	quentin.simon@example.com	M	\N	\N	31	\N
526	Moulin	Eva	eva.moulin@example.com	F	\N	\N	31	\N
527	Garnier	Paul	paul.garnier@example.com	M	\N	\N	31	\N
528	Jacquet	Jade	jade.jacquet@example.com	F	\N	\N	31	\N
529	Benoit	Louis	louis.benoit@example.com	M	\N	\N	31	\N
530	Charpentier	Anaïs	anais.charpentier@example.com	F	\N	\N	31	\N
531	Guillot	Simon	simon.guillot@example.com	M	\N	\N	31	\N
532	Perrot	Amélie	amelie.perrot@example.com	F	\N	\N	31	\N
533	Collet	Ethan	ethan.collet@example.com	M	\N	\N	31	\N
534	David	Elise	elise.david@example.com	F	\N	\N	31	\N
535	Bourgeois	Tom	tom.bourgeois@example.com	M	\N	\N	31	\N
536	Renard	Mia	mia.renard@example.com	F	\N	\N	31	\N
537	Noel	Valentin	valentin.noel@example.com	M	\N	\N	31	\N
538	Lamy	Lilou	lilou.lamy@example.com	F	\N	\N	31	\N
539	Besson	Raphaël	raphael.besson@example.com	M	\N	\N	31	\N
540	Joly	Clémence	clemence.joly@example.com	F	\N	\N	31	\N
541	Legrand	Matéo	mateo.legrand@example.com	M	\N	\N	31	\N
542	Pons	Sarah	sarah.pons@example.com	F	\N	\N	31	\N
543	Aubert	Théo	theo.aubert@example.com	M	\N	\N	31	\N
544	Lemaire	Léna	lena.lemaire@example.com	F	\N	\N	31	\N
545	Brun	Nolan	nolan.brun@example.com	M	\N	\N	31	\N
546	Gilles	Laura	laura.gilles@example.com	F	\N	\N	31	\N
547	Renaud	Yanis	yanis.renaud@example.com	M	\N	\N	31	\N
548	Meunier	Anna	anna.meunier@example.com	F	\N	\N	31	\N
549	Leroy	Eliot	eliot.leroy@example.com	M	\N	\N	31	\N
550	Herve	Lily	lily.herve@example.com	F	\N	\N	31	\N
551	Morin	Enzo	enzo.morin@example.com	M	\N	\N	31	\N
552	Giraud	Jeanne	jeanne.giraud@example.com	F	\N	\N	31	\N
553	Boyer	Timéo	timeo.boyer@example.com	M	\N	\N	31	\N
554	Masson	Lucie	lucie.masson@example.com	F	\N	\N	31	\N
\.


--
-- TOC entry 4917 (class 0 OID 123024)
-- Dependencies: 220
-- Data for Name: localisation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.localisation (id, nom) FROM stdin;
1	Ivato
\.


--
-- TOC entry 4930 (class 0 OID 123150)
-- Dependencies: 233
-- Data for Name: personnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnel (id, nom, email, role, "createdAt", "evenementId", status, "updatedAt") FROM stdin;
26	Randriantsoa	andyandybe243@gmail.com	accueil	2025-07-11 14:17:58.920571	32	accepter	2025-07-11 14:17:58.920571
\.


--
-- TOC entry 4924 (class 0 OID 123066)
-- Dependencies: 227
-- Data for Name: place; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place (id, number, reserved, "tableId") FROM stdin;
\.


--
-- TOC entry 4915 (class 0 OID 123015)
-- Dependencies: 218
-- Data for Name: salle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salle (id, nom, "locationId") FROM stdin;
1	espace 1	1
\.


--
-- TOC entry 4926 (class 0 OID 123074)
-- Dependencies: 229
-- Data for Name: table_event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.table_event (id, numero, capacite, "placeReserve", type, "position", "eventId") FROM stdin;
55	20	6	0	ronde	{"top": 0, "left": 0}	32
54	10	7	1	carree	{"top": 0, "left": 0}	32
50	10	7	6	rectangle	{"top": 0, "left": 0}	31
51	20	5	4	ronde	{"top": 0, "left": 0}	31
52	30	4	3	carree	{"top": 0, "left": 0}	31
53	40	5	4	ronde	{"top": 0, "left": 0}	31
\.


--
-- TOC entry 4918 (class 0 OID 123032)
-- Dependencies: 221
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (email, name, photo, role, "createdAt", id) FROM stdin;
\.


--
-- TOC entry 4931 (class 0 OID 123172)
-- Dependencies: 234
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (email, name, photo, role, "createdAt", id, datedowngraded, forfait_id, forfaitexpirationdate) FROM stdin;
andrea112samuel@gmail.com	samuel Andrea	https://lh3.googleusercontent.com/a/ACg8ocLnRlKYMCiZEig_5YUiVMZTTncaFQoEbnpIWV8etq_yQxNz12ZH=s96-c	organisateur	2025-07-11 13:57:42.379545	6c3a56e6-3256-4c58-89c1-57888d2cd8b6	\N	13	2026-01-07 14:03:34.072
andyandybe243@gmail.com	Andyandy Be	https://lh3.googleusercontent.com/a/ACg8ocJ18ZNIbRw4Ok3mpc_nPAb8QB_-ooInMtoR_o6e4KWZGU-gfw=s96-c	accueil	2025-07-11 14:18:59.850727	455b0bed-dd7f-4214-a5dd-5a1ebb66de67	\N	11	\N
\.


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 222
-- Name: evenement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evenement_id_seq', 32, true);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 235
-- Name: forfait_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.forfait_id_seq', 15, true);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 230
-- Name: invitation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invitation_id_seq', 1, false);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 224
-- Name: invite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invite_id_seq', 554, true);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 219
-- Name: localisation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.localisation_id_seq', 1, true);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 232
-- Name: personnel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personnel_id_seq', 26, true);


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 226
-- Name: place_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.place_id_seq', 1, false);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 217
-- Name: salle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salle_id_seq', 1, true);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 228
-- Name: table_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.table_event_id_seq', 55, true);


--
-- TOC entry 4745 (class 2606 OID 123083)
-- Name: table_event PK_069f2c75f548c6ccae9e1db9515; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event
    ADD CONSTRAINT "PK_069f2c75f548c6ccae9e1db9515" PRIMARY KEY (id);


--
-- TOC entry 4729 (class 2606 OID 123031)
-- Name: localisation PK_296b44eea08ff6807f4430650dd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.localisation
    ADD CONSTRAINT "PK_296b44eea08ff6807f4430650dd" PRIMARY KEY (id);


--
-- TOC entry 4751 (class 2606 OID 123157)
-- Name: personnel PK_33a7253a5d2a326fec3cdc0baa5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT "PK_33a7253a5d2a326fec3cdc0baa5" PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 139398)
-- Name: forfait PK_8d43a883902f582183e4cea7da0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forfait
    ADD CONSTRAINT "PK_8d43a883902f582183e4cea7da0" PRIMARY KEY (id);


--
-- TOC entry 4743 (class 2606 OID 123072)
-- Name: place PK_96ab91d43aa89c5de1b59ee7cca; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT "PK_96ab91d43aa89c5de1b59ee7cca" PRIMARY KEY (id);


--
-- TOC entry 4755 (class 2606 OID 123187)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 4749 (class 2606 OID 123094)
-- Name: invitation PK_beb994737756c0f18a1c1f8669c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY (id);


--
-- TOC entry 4731 (class 2606 OID 123164)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2606 OID 123049)
-- Name: evenement PK_e6d6a11dd36f18ddba5f48a98c0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "PK_e6d6a11dd36f18ddba5f48a98c0" PRIMARY KEY (id);


--
-- TOC entry 4727 (class 2606 OID 123022)
-- Name: salle PK_e85e090433d93f866a116d0c5b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salle
    ADD CONSTRAINT "PK_e85e090433d93f866a116d0c5b4" PRIMARY KEY (id);


--
-- TOC entry 4737 (class 2606 OID 123060)
-- Name: invite PK_fc9fa190e5a3c5d80604a4f63e1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY (id);


--
-- TOC entry 4739 (class 2606 OID 123064)
-- Name: invite UQ_0e72cbbea2e7dd0dfc632db0516; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "UQ_0e72cbbea2e7dd0dfc632db0516" UNIQUE ("tableId", place);


--
-- TOC entry 4753 (class 2606 OID 131196)
-- Name: personnel UQ_29cb88c110bcd6487decd42898a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT "UQ_29cb88c110bcd6487decd42898a" UNIQUE (email, "evenementId");


--
-- TOC entry 4741 (class 2606 OID 123062)
-- Name: invite UQ_300d383212d1fdbbf27bad69760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "UQ_300d383212d1fdbbf27bad69760" UNIQUE (email, "eventId");


--
-- TOC entry 4735 (class 2606 OID 123205)
-- Name: evenement UQ_8a374a510546b79458b118d3980; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "UQ_8a374a510546b79458b118d3980" UNIQUE (nom, utilisateur_id);


--
-- TOC entry 4747 (class 2606 OID 123085)
-- Name: table_event UQ_e407084ed44193a0cfad2afc406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event
    ADD CONSTRAINT "UQ_e407084ed44193a0cfad2afc406" UNIQUE (numero, "eventId");


--
-- TOC entry 4762 (class 2606 OID 123120)
-- Name: invite FK_025bc1c6cd8e811e08d7650fe98; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "FK_025bc1c6cd8e811e08d7650fe98" FOREIGN KEY ("tableId") REFERENCES public.table_event(id);


--
-- TOC entry 4759 (class 2606 OID 123105)
-- Name: evenement FK_165234bc9a7fb9336468be06ce3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "FK_165234bc9a7fb9336468be06ce3" FOREIGN KEY ("salleId") REFERENCES public.salle(id);


--
-- TOC entry 4766 (class 2606 OID 123135)
-- Name: invitation FK_4656a045a6ccee1814c98559806; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "FK_4656a045a6ccee1814c98559806" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4765 (class 2606 OID 123130)
-- Name: table_event FK_4c3fb8046e3766145113fd56359; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_event
    ADD CONSTRAINT "FK_4c3fb8046e3766145113fd56359" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4764 (class 2606 OID 123125)
-- Name: place FK_598a9247c0a930b484fd7015285; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT "FK_598a9247c0a930b484fd7015285" FOREIGN KEY ("tableId") REFERENCES public.table_event(id) ON DELETE CASCADE;


--
-- TOC entry 4767 (class 2606 OID 123158)
-- Name: personnel FK_615e5c83a52165c34a20fa54d5e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT "FK_615e5c83a52165c34a20fa54d5e" FOREIGN KEY ("evenementId") REFERENCES public.evenement(id) ON DELETE CASCADE;


--
-- TOC entry 4768 (class 2606 OID 139399)
-- Name: users FK_8658110006b95fbe3117656e881; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_8658110006b95fbe3117656e881" FOREIGN KEY (forfait_id) REFERENCES public.forfait(id);


--
-- TOC entry 4760 (class 2606 OID 147579)
-- Name: evenement FK_907c1a3ba5234b81fcb83b4f013; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "FK_907c1a3ba5234b81fcb83b4f013" FOREIGN KEY (utilisateur_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4758 (class 2606 OID 123095)
-- Name: salle FK_ae58258d7e83717fa93153c9b28; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salle
    ADD CONSTRAINT "FK_ae58258d7e83717fa93153c9b28" FOREIGN KEY ("locationId") REFERENCES public.localisation(id);


--
-- TOC entry 4761 (class 2606 OID 123100)
-- Name: evenement FK_b88d4959aa2a26f5560b64fa75a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenement
    ADD CONSTRAINT "FK_b88d4959aa2a26f5560b64fa75a" FOREIGN KEY ("locationId") REFERENCES public.localisation(id);


--
-- TOC entry 4763 (class 2606 OID 123115)
-- Name: invite FK_cde6883963112e3ce027b1d7130; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT "FK_cde6883963112e3ce027b1d7130" FOREIGN KEY ("eventId") REFERENCES public.evenement(id) ON DELETE CASCADE;


-- Completed on 2025-07-14 08:34:01

--
-- PostgreSQL database dump complete
--

