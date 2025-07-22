import { useState, useEffect } from 'react';

export function useRoleChapterAccess(role) {
  const [chapAccess, setChapAccess] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccess = async () => {
    setLoading(true);
    const res = await fetch(`/api/access-control/${role}`);
    const data = await res.json();
    let access = data.chap_access || [];
    if (typeof access === 'string') {
      access = access.replace(/[{}]/g, '').split(',').filter(Boolean);
    }
    access = access.map(String); // Always strings
    setChapAccess(access);
    setLoading(false);
  };

  useEffect(() => {
    if (!role) return;
    fetchAccess();
    // eslint-disable-next-line
  }, [role]);

  const updateChapAccess = async (newAccess) => {
    setLoading(true);
    await fetch(`/api/access-control/${role}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chap_access: newAccess }),
    });
    await fetchAccess(); // Always re-fetch after update
    setLoading(false);
  };

  return { chapAccess, updateChapAccess, loading };
} 