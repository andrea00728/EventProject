import React, { useEffect, useState } from "react";
import {
  Settings,
  Users,
  Calendar,
  MapPin,
  Bell,
  Shield,
  Mail,
  Download,
  Upload,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import { useStateContext } from "../context/ContextProvider";

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between w-full py-2">
    <div>
      <label className="block text-sm font-medium">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${enabled ? "bg-blue-600" : "bg-gray-300"
        }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${enabled ? "translate-x-6" : "translate-x-0"
          }`}
      />
    </button>
  </div>
);

const SettingCard = ({ title, children }) => (
  <div className="bg-white shadow rounded-lg p-4 mb-4 w-full">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const IntegrationCard = ({ integration, onConnect }) => (
  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow mb-3">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${integration.color}`}>
        <integration.icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h4 className="font-medium">{integration.name}</h4>
        <p className="text-sm text-gray-500">{integration.description}</p>
      </div>
    </div>
    {integration.connected ? (
      <span className="text-green-600 font-semibold">Connecté</span>
    ) : (
      <button
        onClick={onConnect}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
      >
        Connecter
      </button>
    )}
  </div>
);

const EventPlatformSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { user, isLoading } = useStateContext();
  const [userName, setUserName] = useState("Organisateur");
  const [userEmail, setUserEmail] = useState("email@example.com");
  const [userPhoto, setUserPhoto] = useState("");


  useEffect(() => {
    if (user) {
      setUserName(user.name || "Utilisateur");
      setUserEmail(user.email || "email@example.com");
      setUserPhoto(user.photo);
    }
  }, [user]);

  const [settings, setSettings] = useState({
    general: {
      nom: "Nom de l'organisateur",
      defaultLanguage: "fr",
      email: "exemple@gmail.com",
      dateFormat: "DD/MM/YYYY",
      currency: "EUR",
    },
    events: {
      autoApproval: true,
      allowPublicEvents: true,
      requireDescription: true,
      abonnementActif: true,
    },
  });


  const [integrations, setIntegrations] = useState([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Synchronisation des événements",
      icon: Calendar,
      connected: false,
      color: "bg-green-500",
    },
    {
      id: "paypal",
      name: "Paypal",
      description: "Paiements et facturation",
      icon: FaPaypal,
      connected: false,
      color: "bg-blue-500",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Paiements et facturation",
      icon: CreditCard,
      connected: true,
      color: "bg-purple-500",
    },
  ]);

  const tabs = [
    { id: "general", label: "Général", icon: Settings },
    { id: "events", label: "Événements", icon: Calendar },
    { id: "integrations", label: "Intégrations", icon: CreditCard },
  ];

  const handleSettingChange = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleConnectIntegration = (id) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: true } : i))
    );
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <SettingCard title="Informations de base">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="">
            <label className="block text-sm font-medium mb-2">Nom</label>
            <input
              type="text"
              defaultValue={userName}
              onChange={(e) =>
                handleSettingChange("general", "nom", e.target.value)
              }
              className="input px-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Langue</label>
            <select
              value={settings.general.defaultLanguage}
              onChange={(e) =>
                handleSettingChange("general", "defaultLanguage", e.target.value)
              }
              className="input px-2"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              defaultValue={userEmail}
              onChange={(e) =>
                handleSettingChange("general", "email", e.target.value)
              }
              className="input px-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Format de date</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) =>
                handleSettingChange("general", "dateFormat", e.target.value)
              }
              className="input px-2"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Devise</label>
            <select
              value={settings.general.currency}
              onChange={(e) =>
                handleSettingChange("general", "currency", e.target.value)
              }
              className="input px-2"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="MGA">MGA</option>
            </select>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderEventSettings = () => (
    <div className="space-y-4">
      <SettingCard title="Paramètres des événements">
        <ToggleSwitch
          enabled={settings.events.autoApproval}
          onChange={(v) => handleSettingChange("events", "autoApproval", v)}
          label="Approbation automatique"
          description="Les événements sont automatiquement approuvés"
        />
        <ToggleSwitch
          enabled={settings.events.allowPublicEvents}
          onChange={(v) =>
            handleSettingChange("events", "allowPublicEvents", v)
          }
          label="Événements publics"
        />
        <ToggleSwitch
          enabled={settings.events.requireDescription}
          onChange={(v) =>
            handleSettingChange("events", "requireDescription", v)
          }
          label="Description obligatoire"
        />
        <div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-medium">Abonnement actif</p>
            <button className="bg-gradient-to-br  from-white to-gray-500/50 shadow-green-500/20 px-5 p-1 capitalize rounded-full">premium</button>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-4">
      <SettingCard title="Intégrations disponibles">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => handleConnectIntegration(integration.id)}
          />
        ))}
      </SettingCard>
      {/* <SettingCard title="Sauvegarde">
        <div className="flex flex-col md:flex-row gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importer
          </button>
        </div>
      </SettingCard> */}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "events":
        return renderEventSettings();
      case "integrations":
        return renderIntegrationSettings();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-7xl p-4 md:p-8 w-7xl rounded-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Paramètres
          </h1>
          <button
            onClick={() => console.log("Sauvegardé", settings)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded text-left ${activeTab === tab.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="w-full md:w-3/4">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default EventPlatformSettings;
