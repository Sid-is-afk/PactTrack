import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import EmptyState from '../components/EmptyState';
import useStore from '../store/useStore';

export default function Friends() {
  const { user } = useAuth();

  // --- State ---
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // --- Fetch friends & pending requests ---
  const fetchData = useCallback(async () => {
    try {
      const [friendsData, pendingData] = await Promise.all([
        apiGet('/friendships'),
        apiGet('/friendships/pending'),
      ]);
      setFriends(friendsData);
      setPending(pendingData);
    } catch (err) {
      console.error('Failed to fetch friendship data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Search ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    setSearchError('');
    setRequestSent(false);

    try {
      const result = await apiGet(`/users/search?email=${encodeURIComponent(searchEmail.trim())}`);
      setSearchResult(result);
    } catch (err) {
      setSearchError(err.message || 'User not found');
    } finally {
      setSearchLoading(false);
    }
  };

  // --- Send Request ---
  const handleSendRequest = async () => {
    if (!searchResult) return;
    setActionError('');
    try {
      await apiPost('/friendships/request', { addresseeId: searchResult.id });
      setRequestSent(true);
      fetchData();
    } catch (err) {
      setActionError(err.message || 'Failed to send request');
    }
  };

  // --- Accept / Reject ---
  const handleAccept = async (id) => {
    setActionError('');
    try {
      await apiPut(`/friendships/accept/${id}`);
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleReject = async (id) => {
    setActionError('');
    try {
      await apiPut(`/friendships/reject/${id}`);
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // --- Remove Friend ---
  const handleRemove = async (friendId) => {
    setActionError('');
    try {
      await apiDelete(`/friendships/${friendId}`);
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // --- Toggle Share Dashboard ---
  const handleToggleShare = async (friendshipId, currentShare) => {
    setActionError('');
    try {
      await apiPut(`/friendships/${friendshipId}/toggle-share`, { share: !currentShare });
      fetchData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Check if a user is already a friend or has pending request
  const isAlreadyFriend = searchResult && friends.some(f => f.id === searchResult.id);
  const hasPendingRequest = searchResult && pending.some(p => p.requesterId === searchResult.id);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>👥</span> Community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Connect with friends and track progress together</p>
      </div>

      {actionError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, color: '#ef4444', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠️</span> {actionError}
        </div>
      )}

      {/* ─── Search & Add Friend ─── */}
      <div className="card" style={{ padding: 24, marginBottom: 32, borderRadius: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🔍</span> Find a Friend
        </h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: searchResult || searchError ? 20 : 0 }}>
          <input
            className="input"
            type="email"
            placeholder="Enter friend's email address..."
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            required
            style={{ flex: 1, height: 48, borderRadius: 12 }}
          />
          <button type="submit" className="btn-primary" disabled={searchLoading} style={{ whiteSpace: 'nowrap', height: 48, borderRadius: 12, padding: '0 24px' }}>
            {searchLoading ? '⏳...' : 'Search'}
          </button>
        </form>

        {/* Search Result */}
        {searchError && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--text-secondary)', fontSize: 14 }}>
            😕 {searchError}
          </div>
        )}

        {searchResult && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', borderRadius: 20, border: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #14b8a6, #5eead4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                {searchResult.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{searchResult.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{searchResult.email}</div>
              </div>
            </div>
            <div>
              {isAlreadyFriend ? (
                <span className="badge badge-success" style={{ padding: '8px 16px', borderRadius: 12 }}>Already Friends</span>
              ) : hasPendingRequest ? (
                <span className="badge badge-amber" style={{ padding: '8px 16px', borderRadius: 12 }}>Pending</span>
              ) : requestSent ? (
                <span className="badge badge-success" style={{ padding: '8px 16px', borderRadius: 12 }}>Sent!</span>
              ) : (
                <button className="btn-primary" onClick={handleSendRequest} style={{ padding: '10px 20px', fontSize: 14, borderRadius: 12 }}>
                  Add Friend
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Pending Requests ─── */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📬</span> Pending Requests
            <span className="badge badge-amber" style={{ fontSize: 12 }}>{pending.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map(req => (
              <div key={req.id} className="card-flat" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {req.requester?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{req.requester?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{req.requester?.email || ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleAccept(req.id)} className="badge badge-success" style={{ border: 'none', cursor: 'pointer', padding: '8px 16px' }}>Accept</button>
                  <button onClick={() => handleReject(req.id)} className="badge badge-grey" style={{ border: 'none', cursor: 'pointer', padding: '8px 16px' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Friends List ─── */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🤝</span> My Friends
          {friends.length > 0 && <span className="badge badge-teal" style={{ fontSize: 12 }}>{friends.length}</span>}
        </h2>

        {loading ? (
          <div className="card-flat" style={{ padding: 48, textAlign: 'center', borderRadius: 24 }}>Loading...</div>
        ) : friends.length === 0 ? (
          <EmptyState icon="👥" title="No friends yet" message="Search for a friend by their email address to start tracking together!" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {friends.map(friend => (
              <div key={friend.id} className="card-flat" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                    {friend.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{friend.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{friend.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 18, height: 18, accentColor: '#14b8a6' }}
                      checked={friend.isRequester ? friend.requesterSharesDashboard : friend.addresseeSharesDashboard}
                      onChange={() => handleToggleShare(friend.friendshipId, friend.isRequester ? friend.requesterSharesDashboard : friend.addresseeSharesDashboard)}
                    />
                    Share Stats
                  </label>
                  <button onClick={() => handleRemove(friend.id)} className="btn-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', width: 36, height: 36 }} title="Remove friend">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
