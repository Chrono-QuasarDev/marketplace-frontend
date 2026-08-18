import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import { getInitials } from '../utils/helpers';

function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { username: user?.username || '' },
  });

  const onSubmit = async ({ username }) => {
    setSaving(true);
    const result = await updateProfile(username);
    setSaving(false);
    if (result.success) toast.success('Profile updated');
    else toast.error(result.error || 'Update failed');
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
          {getInitials(user?.username)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.username}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm capitalize text-primary-600">{user?.role}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input className="input-field" {...register('username')} />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

export default Profile;
