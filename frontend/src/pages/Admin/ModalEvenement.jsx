import React, { useEffect, useState } from "react";
import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdOutlineCalendarToday,
  MdVerifiedUser,
  MdAttachMoney,
  MdSearch,
  MdFileDownload,
  MdStars,
  MdLocationCity,
  MdRoom,
  MdQrCode,
  MdStarBorderPurple500,
  MdFilterList 
} from "react-icons/md";
import { formatDate } from "./Evenement";
import PlanSalle from "../../components/planTable/PlanSalle";
import { getTablesByEventId } from "../../services/tableService";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { getPersonnelListByEventId } from "../../services/personnel_service";
import { motion, AnimatePresence } from "framer-motion";
import { DataGrid } from "@mui/x-data-grid";


const ModalEvenement = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState("invites");

  if (!isOpen) return null;
  

  const renderTabContent = () => {
    switch (activeTab) {
      case "invites":
        return <Invites data={data} />;

      case "tables":
        return <TablePlace data={data} />;
      case "personnels":
        return <Personnels data={data} />;
      case "revenu":
        return <Revenus data={data} />;
      case "commande":
        return <Commandes data={data} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
      initial={{opacity:0}}
      animate={{opacity:1}}
      exit={{opacity:0}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full h-screen mx-4 relative overflow-auto">
          {/* En-tête */}
          <div className="flex justify-between items-center pb-3 border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800">
              <MdOutlineCalendarToday className="mr-3 mb-2 inline" />
              Organisé par {data.user.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <h3
            className="text-center text-2xl font-normal my-3"
            style={{ fontFamily: "serif" }}
          >
            Evénement : {data.nom}
          </h3>
          <div className="flex justify-center gap-10 py-5  flex-wrap">
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Type d'événement</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.type}</span>
                <span className="text-[24px]">
                  <MdCalendarToday />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Thème de l'événement</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.theme}</span>
                <span className="text-[24px]">
                  <MdStars />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Date de début</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px] mr-3">
                  {formatDate(data.date)}
                </span>
                <span className="text-[24px]">
                  <MdOutlineCalendarMonth />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Date de fin</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px] mr-3">
                  {formatDate(data.date_fin)}
                </span>
                <span className="text-[24px]">
                  <MdOutlineCalendarMonth />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Type d'abonnement</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">Je sais pas</span>
                <span className="text-[24px]">
                  <MdOutlineCalendarToday />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Localisation</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.location.nom}</span>
                <span className="text-[24px]">
                  <MdRoom />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Salle</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px] mr-3">{data.salle.nom}</span>
                <span className="text-[24px]">
                  <MdLocationCity />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Nombre d'invités</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.invites.length}</span>
                <span className="text-[24px]">
                  <FaUsers />
                </span>
              </div>
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="flex justify-center gap-4 my-6 flex-wrap">
            <button
              onClick={() => setActiveTab("invites")}
              className={`px-4 py-2 rounded-full font-semibold cursor-pointer hover:scale-y-105 hover:scale-x-105 ${
                activeTab === "invites"
                  ? "bg-[#cfc6c4] text-black"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Liste des invités
            </button>
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-4 py-2 rounded-full font-semibold cursor-pointer hover:scale-y-105 hover:scale-x-105 ${
                activeTab === "tables"
                  ? "bg-[#cfc6c4] text-black"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Emplacements des tables
            </button>
            <button
              onClick={() => setActiveTab("personnels")}
              className={`px-4 py-2 rounded-full font-semibold cursor-pointer hover:scale-y-105 hover:scale-x-105 ${
                activeTab === "personnels"
                  ? "bg-[#cfc6c4] text-black"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Liste des personnels
            </button>
            <button
              onClick={() => setActiveTab("commande")}
              className={`px-4 py-2 rounded-full font-semibold cursor-pointer hover:scale-y-105 hover:scale-x-105 ${
                activeTab === "commande"
                  ? "bg-[#cfc6c4] text-black"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Commande
            </button>
            <button
              onClick={() => setActiveTab("revenu")}
              className={`px-4 py-2 rounded-full font-semibold cursor-pointer hover:scale-y-105 hover:scale-x-105 ${
                activeTab === "revenu"
                  ? "bg-[#cfc6c4] text-black"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Revenu
            </button>
          </div>

          {/* Contenu dynamique */}
          <div>{renderTabContent()}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalEvenement;

function Invites({data}){
  const [filterField, setFilterField] = useState("nom");
  const [searchValue, setSearchValue] = useState("");

  const handleExportExcel = () => {
    const exportData = filteredRows.map((p) => ({
      Nom: p.nom,
      Prénom: p.prenom,
      Email: p.email,
      Sexe: p.sex,
      Place: p.place,
      QrCode: "https://example.com/qrcode", // ou p.qrCode
    }));
    handleDownloadXLSX(exportData, "liste_invites");
  };

  const columns = [
    { field: "nom", headerName: "Nom", flex: 1 },
    { field: "prenom", headerName: "Prénom", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "sex", headerName: "Sexe", flex: 0.7 },
    { field: "place", headerName: "Place", flex: 0.7 },
    {
      field: "qrCode",
      headerName: "QR Code",
      flex: 0.5,
      sortable: false,
      renderCell: () => <MdQrCode className="text-3xl text-gray-700" />,
    },
  ];

  const rows = data.invites.map((invite, index) => ({
    id: index,
    ...invite,
  }));

  const filteredRows = rows.filter((row) =>
    row[filterField]?.toString().toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportExcel}
          className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer"
        >
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div>

      <h3 className="text-2xl ml-5 my-3 font-semibold text-gray-800">
        Liste des invités
      </h3>

      {/* Filtrage dynamique */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-500" />
          <select
            className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
          >
            <option value="nom">Nom</option>
            <option value="prenom">Prénom</option>
            <option value="email">Email</option>
            <option value="sex">Sexe</option>
            <option value="place">Place</option>
          </select>
        </div>
        <div className="relative w-full md:w-1/3">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher par ${filterField}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div style={{ width: "100%", height: 500 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[]}
          autoHeight
        />
      </div>
    </div>
  );
}


function TablePlace({ data }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!data.id) return;
    getTablesByEventId(data.id).then(setTables).catch(console.error);
  }, [data.id]);

  return (
    <>
      {/* <div className="flex justify-end mb-4">
        <button className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer">
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div> */}
      <div className="p-4">
        <h3 className="text-2xl ml-5 my-3 font-semibold text-gray-800">
          Emplacement des tables
        </h3>
        <div className="overflow-y-auto flex justify-center py-10">
          <PlanSalle
            event={{ id: data.id }}
            tables={tables}
            setTables={setTables}
          />
        </div>
      </div>
    </>
  );
}

function Personnels({ data }) {
  const [personnelList, setPersonnelList] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getPersonnelListByEventId(data.id);
        setPersonnelList(response);
        console.log("Liste des personnels : ", response);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };
    fetchEvents();
  }, []);

  const handleExportExcel = () => {
    const page = personnelList.map((p) => ({
      Nom: p.nom,
      Email: p.email,
      Status: p.status,
      Role: p.role,
      // QrCode: "https://example.com/qrcode", // Placeholder for QR code URL
    }));
    handleDownloadXLSX(page, "liste_invites");
  };
  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportExcel}
          className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer"
        >
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-2xl ml-5 my-3 font-semibold text-gray-800">
          Liste de personnels
        </h3>
        <div className="overflow-y-auto flex justify-center">
          <table>
            <thead>
              <tr>
                <th className="p-3 text-start">Nom</th>
                <th className="p-3 text-start">Email</th>
                <th className="p-3 text-start">Rôle</th>
                <th className="p-3 text-start">Status</th>
              </tr>
            </thead>
            <tbody>
              {personnelList.map((value, key) => (
                <tr key={key}>
                  <td className="p-3 text-start">{value.nom}</td>
                  <td className="p-3 text-start">{value.email}</td>
                  <td className="p-3 text-start">{value.role}</td>
                  <td className="p-3 text-start">{value.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Revenus({ data }) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <button className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer">
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-2xl ml-5 my-3 font-semibold text-gray-800">
          Les revenus des entrées
        </h3>
        <div className="overflow-y-auto flex justify-center">
          <table>
            <thead>
              <tr>
                <th className="p-3 text-start">Nom</th>
                <th className="p-3 text-start">Prénom</th>
                <th className="p-3 text-start">Email</th>
                <th className="p-3 text-start">Sexe</th>
                <th className="p-3 text-start">Place</th>
                <th className="p-3 text-start">Qr Code</th>
              </tr>
            </thead>
            <tbody>
              {data.invites.map((value, key) => (
                <tr key={key}>
                  <td className="p-3 text-start">{value.nom}</td>
                  <td className="p-3 text-start">{value.prenom}</td>
                  <td className="p-3 text-start">{value.email}</td>
                  <td className="p-3 text-start">{value.sex}</td>
                  <td className="p-3 text-start">{value.place}</td>
                  <td className="p-3 text-start text-4xl">
                    <MdQrCode />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Commandes({ data }) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <button className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer">
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-2xl ml-5 my-3 font-semibold text-gray-800">
          Liste des commandes
        </h3>
        <div className="overflow-y-auto flex justify-center">
          <table>
            <thead>
              <tr>
                <th className="p-3 text-start">Nom</th>
                <th className="p-3 text-start">Prénom</th>
                <th className="p-3 text-start">Email</th>
                <th className="p-3 text-start">Sexe</th>
                <th className="p-3 text-start">Place</th>
                <th className="p-3 text-start">Qr Code</th>
              </tr>
            </thead>
            <tbody>
              {data.invites.map((value, key) => (
                <tr key={key}>
                  <td className="p-3 text-start">{value.nom}</td>
                  <td className="p-3 text-start">{value.prenom}</td>
                  <td className="p-3 text-start">{value.email}</td>
                  <td className="p-3 text-start">{value.sex}</td>
                  <td className="p-3 text-start">{value.place}</td>
                  <td className="p-3 text-start text-4xl">
                    <MdQrCode />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
