import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Clock, Search, Key, Calendar } from 'lucide-react';

export default function UIDAdminPanel() {
  const [users, setUsers] = useState({});
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  
  const [newUid, setNewUid] = useState('');
  const [newDays, setNewDays] = useState(30);
  const [addDaysUid, setAddDaysUid] = useState('');
  const [additionalDays, setAdditionalDays] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    const savedApiUrl = localStorage.getItem('apiUrl');
    if (savedApiKey && savedApiUrl) {
      setApiKey(savedApiKey);
      setApiUrl(savedApiUrl);
      setIsConfigured(true);
      fetchUsers(savedApiUrl, savedApiKey);
    }
  }, []);

  const saveConfig = () => {
    if (!apiKey || !apiUrl) {
      showMessage('error', 'Por favor ingresa la API Key y URL');
      return;
    }
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('apiUrl', apiUrl);
    setIsConfigured(true);
    fetchUsers(apiUrl, apiKey);
    showMessage('success', 'Configuración guardada correctamente');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchUsers = async (url = apiUrl, key = apiKey) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: { 'X-API-Key': key }
      });
      const data = await response.json();
      setUsers(data.users || {});
    } catch (error) {
      showMessage('error', 'Error al cargar usuarios: ' + error.message);
    }
    setLoading(false);
  };

  const addUser = async () => {
    if (!newUid) {
      showMessage('error', 'Ingresa un UID');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ uid: newUid, days: newDays })
      });
      if (response.ok) {
        showMessage('success', `UID ${newUid} agregado con ${newDays} días`);
        setNewUid('');
        setNewDays(30);
        await fetchUsers();
      } else {
        showMessage('error', 'Error al agregar usuario');
      }
    } catch (error) {
      showMessage('error', 'Error: ' + error.message);
    }
    setLoading(false);
  };

  const removeUser = async (uid) => {
    if (!confirm(`¿Eliminar UID ${uid}?`)) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ uid })
      });
      if (response.ok) {
        showMessage('success', `UID ${uid} eliminado`);
        await fetchUsers();
      } else {
        showMessage('error', 'Error al eliminar usuario');
      }
    } catch (error) {
      showMessage('error', 'Error: ' + error.message);
    }
    setLoading(false);
  };

  const addDaysToUser = async () => {
    if (!addDaysUid || additionalDays <= 0) {
      showMessage('error', 'Selecciona un UID y días válidos');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/add-days`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ uid: addDaysUid, days: additionalDays })
      });
      if (response.ok) {
        showMessage('success', `${additionalDays} días agregados a ${addDaysUid}`);
        setAddDaysUid('');
        setAdditionalDays(0);
        await fetchUsers();
      } else {
        showMessage('error', 'Error al agregar días');
      }
    } catch (error) {
      showMessage('error', 'Error: ' + error.message);
    }
    setLoading(false);
  };

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diff = expiration - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredUsers = Object.entries(users).filter(([uid]) =>
    uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <Key className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center mb-8">Configuración Inicial</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">URL de tu Worker</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://tu-worker.workers.dev"
                className="w-full px-4 py-3 bg-white/5 border border-purple-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Tu API Key"
                className="w-full px-4 py-3 bg-white/5 border border-purple-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              onClick={saveConfig}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Panel de Administración UIDs</h1>
            <button
              onClick={() => {
                localStorage.clear();
                setIsConfigured(false);
              }}
              className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all text-sm"
            >
              Cambiar Configuración
            </button>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6 border border-purple-300/30">
              <h2 className="text-xl font-semibold text-purple-200 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Agregar Nuevo UID
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  placeholder="UID"
                  className="w-full px-4 py-3 bg-white/5 border border-purple-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  value={newDays}
                  onChange={(e) => setNewDays(parseInt(e.target.value))}
                  placeholder="Días"
                  className="w-full px-4 py-3 bg-white/5 border border-purple-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addUser}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  Agregar Usuario
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-purple-300/30">
              <h2 className="text-xl font-semibold text-purple-200 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Agregar Días a Usuario
              </h2>
              <div className="space-y-3">
                <select
                  value={addDaysUid}
                  onChange={(e) => setAddDaysUid(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona UID</option>
                  {Object.keys(users).map(uid => (
                    <option key={uid} value={uid}>{uid}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={additionalDays}
                  onChange={(e) => setAdditionalDays(parseInt(e.target.value))}
                  placeholder="Días a agregar"
                  className="w-full px-4 py-3 bg-white/5 border border-purple-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addDaysToUser}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  Agregar Días
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-purple-300/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-purple-200 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Usuarios Registrados ({Object.keys(users).length})
              </h2>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar UID..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 bg-white/5 border border-purple-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-300/30">
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">UID</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Agregado</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Expira</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Días Restantes</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(([uid, data]) => {
                    const daysLeft = getDaysRemaining(data.expiresAt);
                    const isExpired = daysLeft < 0;
                    return (
                      <tr key={uid} className="border-b border-purple-300/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-mono">{uid}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(data.addedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(data.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isExpired ? 'bg-red-500/20 text-red-300' :
                            daysLeft <= 7 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {isExpired ? 'Expirado' : `${daysLeft} días`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => removeUser(uid)}
                            className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No hay usuarios registrados
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
