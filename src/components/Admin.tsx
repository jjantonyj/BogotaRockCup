import React, { useState, useEffect } from 'react';
import { auth, isAdmin, getBands, addBand, updateBand, deleteBand, getMatches, addMatch, updateMatch, deleteMatch, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Plus, Pencil, Trash2, Save, X, Music, Calendar as CalendarIcon, Database } from 'lucide-react';
import bandsData from '../data/bands.json';
import matchesData from '../data/matches.json';

export function Admin() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'bands' | 'matches'>('bands');
  const [bands, setBands] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthReady && user && isAdmin(user.email)) {
      fetchData();
    }
  }, [isAuthReady, user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bandsData, matchesData] = await Promise.all([
        getBands(),
        getMatches()
      ]);
      setBands(bandsData || []);
      setMatches(matchesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('¿Deseas cargar los datos iniciales desde los archivos JSON? Esto podría duplicar datos si ya existen.')) return;
    setLoading(true);
    try {
      for (const band of bandsData) {
        await addBand(band);
      }
      for (const match of matchesData) {
        await addMatch(match);
      }
      alert('Datos cargados exitosamente');
      fetchData();
    } catch (error) {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'bands') {
        if (editingId === 'new') {
          await addBand(formData);
        } else {
          const { id, ...rest } = formData;
          await updateBand(editingId!, rest);
        }
      } else {
        // Validation for matches
        if (!formData.band1Id || !formData.band2Id) {
          alert('Debes seleccionar ambas bandas');
          return;
        }

        if (formData.band1Id === formData.band2Id) {
          alert('No puedes crear un partido con la misma banda');
          return;
        }
        
        const isDuplicate = matches.some(m => 
          m.id !== editingId && 
          ((m.band1Id === formData.band1Id && m.band2Id === formData.band2Id) ||
           (m.band1Id === formData.band2Id && m.band2Id === formData.band1Id))
        );
        
        if (isDuplicate) {
          alert('Ya existe un partido programado entre estas dos bandas');
          return;
        }

        if (editingId === 'new') {
          await addMatch(formData);
        } else {
          const { id, ...rest } = formData;
          await updateMatch(editingId!, rest);
        }
      }
      setEditingId(null);
      setFormData({});
      fetchData();
    } catch (error) {
      alert('Error al guardar los cambios');
    }
  };

  const handleDelete = async (id: string) => {
    console.log(`Attempting to delete ${activeTab} with ID:`, id);
    
    if (activeTab === 'bands') {
      const hasMatch = matches.some(m => m.band1Id === id || m.band2Id === id);
      if (hasMatch) {
        alert('No se puede eliminar esta banda porque tiene partidos asociados. Elimina primero los partidos.');
        return;
      }
    }

    if (!window.confirm('¿Estás seguro de eliminar este elemento?')) return;
    try {
      if (activeTab === 'bands') {
        await deleteBand(id);
      } else {
        await deleteMatch(id);
      }
      console.log('Deletion successful, fetching new data...');
      fetchData();
    } catch (error) {
      console.error('Deletion error:', error);
      alert('Error al eliminar');
    }
  };

  if (!isAuthReady) return <div className="p-20 text-center">Cargando...</div>;

  if (!user || !isAdmin(user.email)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl text-center max-w-md"
        >
          <div className="w-20 h-20 bg-bogota-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-bogota-red" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Acceso Denegado</h2>
          <p className="text-zinc-500 font-medium mb-8">
            No tienes permisos para acceder al módulo administrativo. Por favor, contacta al administrador del sistema.
          </p>
          {!user && (
            <p className="text-zinc-400 text-sm">Debes iniciar sesión con una cuenta autorizada.</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Panel <span className="text-bogota-red">Administrativo</span>
          </h1>
          <p className="text-zinc-500 font-medium">Gestiona las bandas y los partidos del torneo.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSeedData}
            className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-zinc-700 transition-all"
            title="Cargar datos iniciales"
          >
            <Database className="w-4 h-4" /> Sembrar Datos
          </button>
          
          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('bands')}
              className={`px-6 py-2 rounded-xl font-bold text-sm uppercase transition-all flex items-center gap-2 ${
                activeTab === 'bands' ? 'bg-bogota-red text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" /> Bandas
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-2 rounded-xl font-bold text-sm uppercase transition-all flex items-center gap-2 ${
                activeTab === 'matches' ? 'bg-bogota-red text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Partidos
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic">
            Lista de {activeTab === 'bands' ? 'Bandas' : 'Partidos'}
          </h2>
          <button
            onClick={() => {
              setEditingId('new');
              setFormData(activeTab === 'bands' ? { 
                name: '', 
                genre: '', 
                locality: '', 
                contactName: '', 
                email: '', 
                videos: ['', '', ''], 
                social: { instagram: '', facebook: '' } 
              } : { band1Id: '', band2Id: '', stage: '', date: '', durationMinutes: 90 });
            }}
            className="bg-bogota-yellow text-zinc-950 px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-yellow-400 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Información</th>
                <th className="px-6 py-4">Detalles</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {editingId === 'new' && (
                <tr className="bg-bogota-red/5 animate-pulse">
                  <td className="px-6 py-4" colSpan={2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTab === 'bands' ? (
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            placeholder="Nombre de la banda"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                          <input
                            placeholder="Género"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.genre || ''}
                            onChange={e => setFormData({...formData, genre: e.target.value})}
                          />
                          <input
                            placeholder="Persona de Contacto"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.contactName || ''}
                            onChange={e => setFormData({...formData, contactName: e.target.value})}
                          />
                          <input
                            placeholder="Correo Electrónico"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.email || ''}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                          <input
                            placeholder="Localidad"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.locality || ''}
                            onChange={e => setFormData({...formData, locality: e.target.value})}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              placeholder="Instagram"
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                              value={formData.social?.instagram || ''}
                              onChange={e => setFormData({...formData, social: { ...formData.social, instagram: e.target.value }})}
                            />
                            <input
                              placeholder="Facebook"
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                              value={formData.social?.facebook || ''}
                              onChange={e => setFormData({...formData, social: { ...formData.social, facebook: e.target.value }})}
                            />
                          </div>
                          <div className="col-span-full grid grid-cols-3 gap-2">
                            <input
                              placeholder="Video YouTube 1"
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                              value={formData.videos?.[0] || ''}
                              onChange={e => {
                                const v = [...(formData.videos || ['', '', ''])];
                                v[0] = e.target.value;
                                setFormData({...formData, videos: v});
                              }}
                            />
                            <input
                              placeholder="Video YouTube 2"
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                              value={formData.videos?.[1] || ''}
                              onChange={e => {
                                const v = [...(formData.videos || ['', '', ''])];
                                v[1] = e.target.value;
                                setFormData({...formData, videos: v});
                              }}
                            />
                            <input
                              placeholder="Video YouTube 3"
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                              value={formData.videos?.[2] || ''}
                              onChange={e => {
                                const v = [...(formData.videos || ['', '', ''])];
                                v[2] = e.target.value;
                                setFormData({...formData, videos: v});
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <select
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.band1Id || ''}
                            onChange={e => setFormData({...formData, band1Id: e.target.value})}
                          >
                            <option value="">Seleccionar Banda 1</option>
                            {bands.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                          <select
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.band2Id || ''}
                            onChange={e => setFormData({...formData, band2Id: e.target.value})}
                          >
                            <option value="">Seleccionar Banda 2</option>
                            {bands.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                          <input
                            placeholder="Etapa (Ej: Octavos)"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.stage || ''}
                            onChange={e => setFormData({...formData, stage: e.target.value})}
                          />
                          <input
                            type="datetime-local"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.date || ''}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                          />
                          <input
                            type="number"
                            placeholder="Duración (min)"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                            value={formData.durationMinutes || 90}
                            onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                          />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={handleSave} className="p-2 bg-green-600 rounded-lg hover:bg-green-500"><Save className="w-4 h-4" /></button>
                      <button onClick={handleCancel} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}
              
              {activeTab === 'bands' ? bands.map(band => (
                <tr key={band.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === band.id ? (
                      <div className="space-y-2">
                        <input
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full font-bold"
                          value={formData.name || ''}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Nombre"
                        />
                        <input
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                          value={formData.contactName || ''}
                          onChange={e => setFormData({...formData, contactName: e.target.value})}
                          placeholder="Contacto"
                        />
                        <input
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                          value={formData.email || ''}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="Email"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-white">{band.name}</div>
                        <div className="text-xs text-zinc-500">{band.contactName}</div>
                        <div className="text-[10px] text-zinc-600">{band.email}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === band.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                            value={formData.genre || ''}
                            onChange={e => setFormData({...formData, genre: e.target.value})}
                            placeholder="Género"
                          />
                          <input
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                            value={formData.locality || ''}
                            onChange={e => setFormData({...formData, locality: e.target.value})}
                            placeholder="Localidad"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                            value={formData.social?.instagram || ''}
                            onChange={e => setFormData({...formData, social: { ...formData.social, instagram: e.target.value }})}
                            placeholder="Instagram"
                          />
                          <input
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                            value={formData.social?.facebook || ''}
                            onChange={e => setFormData({...formData, social: { ...formData.social, facebook: e.target.value }})}
                            placeholder="Facebook"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {[0, 1, 2].map(i => (
                            <input
                              key={i}
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-[10px] w-full"
                              value={formData.videos?.[i] || ''}
                              onChange={e => {
                                const v = [...(formData.videos || ['', '', ''])];
                                v[i] = e.target.value;
                                setFormData({...formData, videos: v});
                              }}
                              placeholder={`Video ${i+1}`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-sm text-zinc-300 font-medium">{band.genre} • {band.locality}</div>
                        <div className="flex gap-2 text-[10px] text-zinc-500">
                          {band.social?.instagram && <span>IG: {band.social.instagram}</span>}
                          {band.social?.facebook && <span>FB: {band.social.facebook}</span>}
                        </div>
                        <div className="text-[10px] text-zinc-600 truncate max-w-[200px]">
                          Videos: {band.videos?.filter(Boolean).length || 0} cargados
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === band.id ? (
                        <>
                          <button onClick={handleSave} className="p-2 bg-green-600 rounded-lg hover:bg-green-500"><Save className="w-4 h-4" /></button>
                          <button onClick={handleCancel} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(band)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(band.id)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-bogota-red transition-all"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : matches.map(match => (
                <tr key={match.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === match.id ? (
                      <div className="flex flex-col gap-2">
                        <select
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                          value={formData.band1Id || ''}
                          onChange={e => setFormData({...formData, band1Id: e.target.value})}
                        >
                          <option value="">Seleccionar Banda 1</option>
                          {bands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <span className="text-zinc-500 text-center text-xs">vs</span>
                        <select
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                          value={formData.band2Id || ''}
                          onChange={e => setFormData({...formData, band2Id: e.target.value})}
                        >
                          <option value="">Seleccionar Banda 2</option>
                          {bands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="font-bold">
                        {bands.find(b => b.id === match.band1Id)?.name || match.band1Id} vs {bands.find(b => b.id === match.band2Id)?.name || match.band2Id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === match.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          placeholder="Etapa"
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                          value={formData.stage || ''}
                          onChange={e => setFormData({...formData, stage: e.target.value})}
                        />
                        <input
                          type="datetime-local"
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                          value={formData.date || ''}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                        <input
                          type="number"
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full"
                          value={formData.durationMinutes || 90}
                          onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-500">
                        <div className="font-bold text-zinc-300">{match.stage}</div>
                        <div>{match.date} ({match.durationMinutes} min)</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === match.id ? (
                        <>
                          <button onClick={handleSave} className="p-2 bg-green-600 rounded-lg hover:bg-green-500"><Save className="w-4 h-4" /></button>
                          <button onClick={handleCancel} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(match)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(match.id)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-bogota-red transition-all"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {loading && (
          <div className="p-12 text-center text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
            Cargando datos...
          </div>
        )}
      </div>
    </div>
  );
}
