import React, { useState, useEffect } from 'react';
import { User, Home, DollarSign, Bell, LogOut, Menu, X, Plus, Mail } from 'lucide-react';

const SyndicApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('actualites');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Chargement des données depuis le stockage
  const [users, setUsers] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Initialisation des données
  useEffect(() => {
    const initData = async () => {
      try {
        // Charger les utilisateurs
        let usersData = await window.storage.get('syndic-users');
        if (!usersData) {
          const defaultUsers = [
            { id: 1, nom: 'Admin Syndic', email: 'admin@syndic.com', appartement: 'Administration', role: 'admin', password: 'admin123' },
            { id: 2, nom: 'Sophie Laurent', email: 'sophie@email.com', appartement: 'A102', role: 'resident', password: 'user123' },
            { id: 3, nom: 'Pierre Moreau', email: 'pierre@email.com', appartement: 'A103', role: 'resident', password: 'user123' }
          ];
          await window.storage.set('syndic-users', JSON.stringify(defaultUsers));
          setUsers(defaultUsers);
        } else {
          setUsers(JSON.parse(usersData.value));
        }
        
        // Charger les actualités
        let actusData = await window.storage.get('syndic-actualites');
        if (!actusData) {
          const defaultActus = [
            { id: 1, titre: 'Bienvenue sur la plateforme', contenu: 'Cette plateforme vous permet de suivre les actualités de votre immeuble et vos paiements.', date: '2026-01-06', auteur: 'Admin' },
            { id: 2, titre: 'Assemblée Générale', contenu: 'La prochaine AG aura lieu le 15 février à 18h dans la salle commune.', date: '2026-01-05', auteur: 'Admin' }
          ];
          await window.storage.set('syndic-actualites', JSON.stringify(defaultActus));
          setActualites(defaultActus);
        } else {
          setActualites(JSON.parse(actusData.value));
        }
        
        // Charger les paiements
        let paiementsData = await window.storage.get('syndic-paiements');
        if (!paiementsData) {
          const defaultPaiements = [
            { id: 1, userId: 2, appartement: 'A102', nom: 'Sophie Laurent', type: 'Charges mensuelles', montant: 150, statut: 'payé', date: '2026-01-01' },
            { id: 2, userId: 3, appartement: 'A103', nom: 'Pierre Moreau', type: 'Charges mensuelles', montant: 150, statut: 'en attente', date: '2026-01-01' },
            { id: 3, userId: 2, appartement: 'A102', nom: 'Sophie Laurent', type: 'Travaux ascenseur', montant: 300, statut: 'payé', date: '2025-12-15' }
          ];
          await window.storage.set('syndic-paiements', JSON.stringify(defaultPaiements));
          setPaiements(defaultPaiements);
        } else {
          setPaiements(JSON.parse(paiementsData.value));
        }
      } catch (error) {
        console.error('Erreur initialisation:', error);
      }
    };
    
    initData();
  }, []);
  
  // Formulaires
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [nouvelleActu, setNouvelleActu] = useState({ titre: '', contenu: '' });
  const [nouveauPaiement, setNouveauPaiement] = useState({ userId: '', type: '', montant: '' });
  const [nouvelUtilisateur, setNouvelUtilisateur] = useState({ nom: '', email: '', appartement: '', password: '' });

  // Sauvegarde des données
  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  // Connexion
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      addNotification(`Bienvenue ${user.nom} !`, 'success');
      setLoginForm({ email: '', password: '' });
    } else {
      addNotification('Identifiants incorrects', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('actualites');
    setMenuOpen(false);
  };

  // Gestion des notifications
  const addNotification = (message, type = 'info') => {
    const newNotif = { id: Date.now(), message, type, date: new Date().toLocaleString() };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  };

  // Gestion des actualités
  const ajouterActualite = async (e) => {
    e.preventDefault();
    if (!nouvelleActu.titre || !nouvelleActu.contenu) {
      addNotification('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    const newActu = {
      id: Date.now(),
      titre: nouvelleActu.titre,
      contenu: nouvelleActu.contenu,
      date: new Date().toISOString().split('T')[0],
      auteur: currentUser.nom
    };
    
    const newActualites = [newActu, ...actualites];
    setActualites(newActualites);
    await saveData('syndic-actualites', newActualites);
    setNouvelleActu({ titre: '', contenu: '' });
    addNotification('Actualité publiée avec succès', 'success');
  };

  const supprimerActualite = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette actualité ?')) return;
    const newActualites = actualites.filter(a => a.id !== id);
    setActualites(newActualites);
    await saveData('syndic-actualites', newActualites);
    addNotification('Actualité supprimée', 'success');
  };

  // Gestion des paiements
  const ajouterPaiement = async (e) => {
    e.preventDefault();
    if (!nouveauPaiement.userId || !nouveauPaiement.type || !nouveauPaiement.montant) {
      addNotification('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    const user = users.find(u => u.id === parseInt(nouveauPaiement.userId));
    const newPaiement = {
      id: Date.now(),
      userId: parseInt(nouveauPaiement.userId),
      appartement: user.appartement,
      nom: user.nom,
      type: nouveauPaiement.type,
      montant: parseFloat(nouveauPaiement.montant),
      statut: 'en attente',
      date: new Date().toISOString().split('T')[0]
    };
    
    const newPaiements = [newPaiement, ...paiements];
    setPaiements(newPaiements);
    await saveData('syndic-paiements', newPaiements);
    setNouveauPaiement({ userId: '', type: '', montant: '' });
    addNotification(`Paiement créé pour ${user.nom}`, 'success');
    
    // Simulation envoi email
    addNotification(`📧 Email envoyé à ${user.email}`, 'info');
  };

  const changerStatutPaiement = async (id, nouveauStatut) => {
    const newPaiements = paiements.map(p => 
      p.id === id ? { ...p, statut: nouveauStatut } : p
    );
    setPaiements(newPaiements);
    await saveData('syndic-paiements', newPaiements);
    
    const paiement = paiements.find(p => p.id === id);
    addNotification(`Statut mis à jour: ${nouveauStatut}`, 'success');
    
    // Simulation envoi email
    const user = users.find(u => u.id === paiement.userId);
    if (user) {
      addNotification(`📧 Email de confirmation envoyé à ${user.email}`, 'info');
    }
  };

  const supprimerPaiement = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce paiement ?')) return;
    const newPaiements = paiements.filter(p => p.id !== id);
    setPaiements(newPaiements);
    await saveData('syndic-paiements', newPaiements);
    addNotification('Paiement supprimé', 'success');
  };

  // Gestion des utilisateurs
  const ajouterUtilisateur = async (e) => {
    e.preventDefault();
    if (!nouvelUtilisateur.nom || !nouvelUtilisateur.email || !nouvelUtilisateur.appartement || !nouvelUtilisateur.password) {
      addNotification('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    if (users.find(u => u.email === nouvelUtilisateur.email)) {
      addNotification('Cet email existe déjà', 'error');
      return;
    }
    
    const newUser = {
      id: Date.now(),
      ...nouvelUtilisateur,
      role: 'resident'
    };
    
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    await saveData('syndic-users', newUsers);
    setNouvelUtilisateur({ nom: '', email: '', appartement: '', password: '' });
    addNotification('Utilisateur créé avec succès', 'success');
    
    // Simulation envoi email
    addNotification(`📧 Email de bienvenue envoyé à ${newUser.email}`, 'info');
  };

  const supprimerUtilisateur = async (id) => {
    if (id === currentUser?.id) {
      addNotification('Vous ne pouvez pas supprimer votre propre compte', 'error');
      return;
    }
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    await saveData('syndic-users', newUsers);
    addNotification('Utilisateur supprimé', 'success');
  };

  // Filtrer les paiements selon l'utilisateur
  const mesPaiements = currentUser?.role === 'admin' 
    ? paiements 
    : paiements.filter(p => p.userId === currentUser?.id);

  // Interface de connexion
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion Syndic</h1>
            <p className="text-gray-600 mt-2">Connectez-vous à votre espace</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Se connecter
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Comptes de démonstration :</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@syndic.com / admin123</p>
              <p><strong>Résident:</strong> sophie@email.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface principale
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg shadow-lg text-white animate-slide-in ${
              notif.type === 'success' ? 'bg-green-500' :
              notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            <p className="font-medium">{notif.message}</p>
            <p className="text-xs mt-1 opacity-90">{notif.date}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Home size={32} />
              <div>
                <h1 className="text-2xl font-bold">Gestion Syndic</h1>
                <p className="text-sm text-indigo-200">Bienvenue, {currentUser.nom}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-indigo-700 px-4 py-2 rounded-lg">
                <User size={20} />
                <span className="text-sm">{currentUser.appartement}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
              
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`bg-white shadow-md ${menuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:space-x-1 py-2">
            <button
              onClick={() => { setActiveTab('actualites'); setMenuOpen(false); }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition ${
                activeTab === 'actualites' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
              }`}
            >
              <Bell size={20} />
              <span>Actualités</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('paiements'); setMenuOpen(false); }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition ${
                activeTab === 'paiements' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
              }`}
            >
              <DollarSign size={20} />
              <span>Paiements</span>
            </button>
            
            {currentUser.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('utilisateurs'); setMenuOpen(false); }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition ${
                  activeTab === 'utilisateurs' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
                }`}
              >
                <User size={20} />
                <span>Utilisateurs</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="container mx-auto px-4 py-8">
        {/* Onglet Actualités */}
        {activeTab === 'actualites' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Fil d'actualités</h2>
            
            {currentUser.role === 'admin' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Plus className="mr-2" size={20} />
                  Nouvelle actualité
                </h3>
                <form onSubmit={ajouterActualite} className="space-y-4">
                  <input
                    type="text"
                    value={nouvelleActu.titre}
                    onChange={(e) => setNouvelleActu({...nouvelleActu, titre: e.target.value})}
                    placeholder="Titre de l'actualité"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <textarea
                    value={nouvelleActu.contenu}
                    onChange={(e) => setNouvelleActu({...nouvelleActu, contenu: e.target.value})}
                    placeholder="Contenu de l'actualité"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Publier
                  </button>
                </form>
              </div>
            )}
            
            <div className="space-y-4">
              {actualites.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                  Aucune actualité pour le moment
                </div>
              ) : (
                actualites.map(actu => (
                  <div key={actu.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">{actu.titre}</h3>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => supprimerActualite(actu.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{actu.contenu}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>📅 {new Date(actu.date).toLocaleDateString('fr-FR')}</span>
                      <span>👤 {actu.auteur}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Onglet Paiements */}
        {activeTab === 'paiements' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentUser.role === 'admin' ? 'Gestion des paiements' : 'Mes paiements'}
            </h2>
            
            {currentUser.role === 'admin' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Plus className="mr-2" size={20} />
                  Créer un paiement
                </h3>
                <form onSubmit={ajouterPaiement} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={nouveauPaiement.userId}
                    onChange={(e) => setNouveauPaiement({...nouveauPaiement, userId: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un résident</option>
                    {users.filter(u => u.role === 'resident').map(user => (
                      <option key={user.id} value={user.id}>
                        {user.nom} - {user.appartement}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={nouveauPaiement.type}
                    onChange={(e) => setNouveauPaiement({...nouveauPaiement, type: e.target.value})}
                    placeholder="Type (ex: Charges)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  
                  <input
                    type="number"
                    step="0.01"
                    value={nouveauPaiement.montant}
                    onChange={(e) => setNouveauPaiement({...nouveauPaiement, montant: e.target.value})}
                    placeholder="Montant (€)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Créer
                  </button>
                </form>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              {mesPaiements.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                  Aucun paiement enregistré
                </div>
              ) : (
                mesPaiements.map(paiement => (
                  <div key={paiement.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{paiement.type}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            paiement.statut === 'payé' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {paiement.statut}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📍 Appartement: {paiement.appartement}</p>
                          <p>👤 {paiement.nom}</p>
                          <p>📅 {new Date(paiement.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">{paiement.montant}€</p>
                        </div>
                        
                        {currentUser.role === 'admin' && (
                          <div className="flex space-x-2">
                            {paiement.statut === 'en attente' && (
                              <button
                                onClick={() => changerStatutPaiement(paiement.id, 'payé')}
                                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                                title="Marquer comme payé"
                              >
                                <DollarSign size={20} />
                              </button>
                            )}
                            <button
                              onClick={() => supprimerPaiement(paiement.id)}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                              title="Supprimer"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {mesPaiements.length > 0 && (
              <div className="bg-indigo-50 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-3xl font-bold text-indigo-600">
                    {mesPaiements.reduce((sum, p) => sum + p.montant, 0).toFixed(2)}€
                  </span>
                </div>
                {currentUser.role !== 'admin' && (
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      Payé: {mesPaiements.filter(p => p.statut === 'payé').reduce((sum, p) => sum + p.montant, 0).toFixed(2)}€
                    </span>
                    <span className="text-orange-600 font-medium">
                      En attente: {mesPaiements.filter(p => p.statut === 'en attente').reduce((sum, p) => sum + p.montant, 0).toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Onglet Utilisateurs (Admin uniquement) */}
        {activeTab === 'utilisateurs' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h2>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Plus className="mr-2" size={20} />
                Nouvel utilisateur
              </h3>
              <form onSubmit={ajouterUtilisateur} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  value={nouvelUtilisateur.nom}
                  onChange={(e) => setNouvelUtilisateur({...nouvelUtilisateur, nom: e.target.value})}
                  placeholder="Nom complet"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  value={nouvelUtilisateur.email}
                  onChange={(e) => setNouvelUtilisateur({...nouvelUtilisateur, email: e.target.value})}
                  placeholder="Email"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  value={nouvelUtilisateur.appartement}
                  onChange={(e) => setNouvelUtilisateur({...nouvelUtilisateur, appartement: e.target.value})}
                  placeholder="N° Appart"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <input
                  type="password"
                  value={nouvelUtilisateur.password}
                  onChange={(e) => setNouvelUtilisateur({...nouvelUtilisateur, password: e.target.value})}
                  placeholder="Mot de passe"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Créer
                </button>
              </form>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appartement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.appartement}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => supprimerUtilisateur(user.id)}
                              className="text-red-600 hover:text-red-900 transition"
                            >
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SyndicApp;
