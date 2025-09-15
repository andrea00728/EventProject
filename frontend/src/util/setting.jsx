import React, { useState } from 'react';
import {
  Settings, Users, Calendar, MapPin, Bell, Shield,
  Mail, Download, Upload, CreditCard, ChevronRight
} from 'lucide-react';

const EventPlatformSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      nom: "Nom de l'organisateur",
      defaultLanguage: 'fr',
      email: 'exemple@gmail.com',
      dateFormat: 'DD/MM/YYYY',
      currency: 'EUR'
    },
    events: {
      autoApproval: true,
      maxCapacity: 1000,
      defaultDuration: 120,
      allowPublicEvents: true,
      requireDescription: true
    }
  });

  const [integrations, setIntegrations] = useState([
    {
      id: 'mailchimp',
      name: 'MailChimp',
      description: 'Synchronisation des contacts',
      icon: Mail,
      connected: false,
      color: 'bg-blue-100'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Synchronisation des événements',
      icon: Calendar,
      connected: false,
      color: 'bg-green-100'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Paiements et facturation',
      icon: CreditCard,
      connected: true,
      color: 'bg-purple-100'
    }
  ]);

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'integrations', label: 'Intégrations', icon: CreditCard }
  ];

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleConnectIntegration = (id) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, connected: true }
          : integration
      )
    );
  };

  const SettingsInput = ({ label, value, onChange, type = 'text', options }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="p-2 border rounded"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) : e.target.value)}
          className="p-2 border rounded"
        />
      )}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const IntegrationCard = ({ integration, onConnect }) => {
    const Icon = integration.icon;
    return (
      <div className="flex items-center justify-between border p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${integration.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold">{integration.name}</p>
            <p className="text-sm text-gray-500">{integration.description}</p>
          </div>
        </div>
        {integration.connected ? (
          <span className="text-green-600 font-medium">Connecté</span>
        ) : (
          <button
            onClick={onConnect}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Connecter
          </button>
        )}
      </div>
    );
  };

  const renderGeneralSettings = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingsInput
        label="Nom de l'organisateur"
        value={settings.general.nom}
        onChange={(v) => handleSettingChange('general', 'nom', v)}
      />
      <SettingsInput
        label="Langue"
        value={settings.general.defaultLanguage}
        onChange={(v) => handleSettingChange('general', 'defaultLanguage', v)}
        options={[
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'Anglais' }
        ]}
      />
      <SettingsInput
        label="E-mail"
        value={settings.general.email}
        onChange={(v) => handleSettingChange('general', 'email', v)}
      />
      <SettingsInput
        label="Format de date"
        value={settings.general.dateFormat}
        onChange={(v) => handleSettingChange('general', 'dateFormat', v)}
        options={[
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
        ]}
      />
      <SettingsInput
        label="Devise"
        value={settings.general.currency}
        onChange={(v) => handleSettingChange('general', 'currency', v)}
        options={[
          { value: 'EUR', label: 'Euro' },
          { value: 'USD', label: 'Dollar' }
        ]}
      />
    </div>
  );

  const renderEventSettings = () => (
    <div className="space-y-4">
      <ToggleSwitch
        label="Approbation automatique"
        enabled={settings.events.autoApproval}
        onChange={(v) => handleSettingChange('events', 'autoApproval', v)}
      />
      <ToggleSwitch
        label="Événements publics autorisés"
        enabled={settings.events.allowPublicEvents}
        onChange={(v) => handleSettingChange('events', 'allowPublicEvents', v)}
      />
      <ToggleSwitch
        label="Description requise"
        enabled={settings.events.requireDescription}
        onChange={(v) => handleSettingChange('events', 'requireDescription', v)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsInput
          label="Capacité maximale"
          type="number"
          value={settings.events.maxCapacity}
          onChange={(v) => handleSettingChange('events', 'maxCapacity', v)}
        />
        <SettingsInput
          label="Durée par défaut (min)"
          type="number"
          value={settings.events.defaultDuration}
          onChange={(v) => handleSettingChange('events', 'defaultDuration', v)}
        />
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-4">
      {integrations.map((i) => (
        <IntegrationCard
          key={i.id}
          integration={i}
          onConnect={() => handleConnectIntegration(i.id)}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'events': return renderEventSettings();
      case 'integrations': return renderIntegrationSettings();
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 border rounded-lg p-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded mb-2 text-left ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="w-full md:flex-1 border rounded-lg p-6 space-y-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Paramètres
            </h2>
            <button
              onClick={() => console.log('Sauvegarde', settings)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EventPlatformSettings;
