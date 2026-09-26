import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { User, Mail, Shield, Upload, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const MyProfile = () => {
  const { user, updateProfile, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('name', name);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await updateProfile(formData);
    } catch (err) {
      // toast in store
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account information and preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl ring-4 ring-indigo-500/20 shadow-md">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : <User size={36} />}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                  <Shield size={12} /> {user?.role?.replace('_', ' ') || 'Staff'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned System Role
              </label>
              <input
                type="text"
                value={user?.role?.replace('_', ' ').toUpperCase() || 'WAREHOUSE STAFF'}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
