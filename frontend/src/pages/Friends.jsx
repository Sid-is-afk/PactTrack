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
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'leaderboard', 'challenges'

  const leaderboard = useStore(s => s.leaderboard);
  const challenges = useStore(s => s.challenges);
  const fetchGamificationData = useStore(s => s.fetchGamificationData);
  const joinChallenge = useStore(s => s.joinChallenge);

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
    fetchGamificationData();
  }, [fetchData, fetchGamificationData]);

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
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>👥 Community</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Compete with friends and join challenges</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, padding: 4, background: 'var(--bg-card)', borderRadius: 12, width: 'fit-content' }}>
        {[
          { id: 'friends', label: 'Friends', icon: '🤝' },
          { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
          { id: 'challenges', label: 'Challenges', icon: '🎯' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 13, fontWeight: 500 }}>
          ⚠️ {actionError}
        </div>
      )}

      {activeTab === 'friends' && (
        <>
          {/* ─── Search & Add Friend ─── */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔍</span> Find a Friend
            </h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: searchResult || searchError ? 16 : 0 }}>
              <input
                className="input"
                type="email"
                placeholder="Enter friend's email address..."
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" disabled={searchLoading} style={{ whiteSpace: 'nowrap' }}>
                {searchLoading ? '⏳ Searching...' : '🔎 Search'}
              </button>
            </form>

            {/* Search Result */}
            {searchError && (
              <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--text-secondary)', fontSize: 13 }}>
                😕 {searchError}
              </div>
            )}

            {searchResult && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(20, 184, 166, 0.05)', borderRadius: 12, border: '1px solid rgba(20, 184, 166, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #5c7cfa, #748ffc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {searchResult.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{searchResult.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{searchResult.email}</div>
                  </div>
                </div>
                <div>
                  {isAlreadyFriend ? (
                    <span className="badge badge-success" style={{ padding: '6px 14px' }}>✓ Already Friends</span>
                  ) : hasPendingRequest ? (
                    <span className="badge badge-amber" style={{ padding: '6px 14px' }}>⏳ Pending</span>
                  ) : requestSent ? (
                    <span className="badge badge-success" style={{ padding: '6px 14px' }}>✓ Request Sent!</span>
                  ) : (
                    <button className="btn-primary" onClick={handleSendRequest} style={{ padding: '8px 18px', fontSize: 13 }}>
                      ➕ Add Friend
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── Pending Requests ─── */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📬</span> Pending Requests
                <span className="badge badge-amber" style={{ fontSize: 11 }}>{pending.length}</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.map(req => (
                  <div key={req.id} className="card-flat" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {req.requester?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{req.requester?.name || 'Unknown'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{req.requester?.email || ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleAccept(req.id)} className="btn-success-soft">✓ Accept</button>
                      <button onClick={() => handleReject(req.id)} className="btn-danger-soft">✗ Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Friends List ─── */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🤝</span> My Friends
              {friends.length > 0 && <span className="badge badge-teal" style={{ fontSize: 11 }}>{friends.length}</span>}
            </h2>

            {loading ? (
              <div className="card-flat" style={{ padding: 40, textAlign: 'center' }}>Loading friends...</div>
            ) : friends.length === 0 ? (
              <EmptyState icon="👥" title="No friends yet" message="Search for a friend by their email address!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {friends.map(friend => (
                  <div key={friend.id} className="card-flat" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                        {friend.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{friend.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{friend.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={friend.isRequester ? friend.requesterSharesDashboard : friend.addresseeSharesDashboard}
                            onChange={() => handleToggleShare(friend.friendshipId, friend.isRequester ? friend.requesterSharesDashboard : friend.addresseeSharesDashboard)}
                          />
                          Share Dashboard
                        </label>
                      </div>
                      <button onClick={() => handleRemove(friend.id)} className="btn-danger-soft" style={{ padding: '6px 12px', fontSize: 13 }}>🗑️ Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'leaderboard' && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏆</span> Global Leaderboard
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leaderboard.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 14, background: u.id === user.uid ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: u.id === user.uid ? '1px solid rgba(99, 102, 241, 0.2)' : 'none' }}>
                <span style={{ fontSize: 18, fontWeight: 800, width: 30, color: i < 3 ? '#f59e0b' : 'var(--text-tertiary)' }}>#{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{u.name} {u.id === user.uid && '(You)'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Level {u.level || 1} • {u.xp || 0} XP</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-color)' }}>
                  Lvl {u.level || 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {challenges.length === 0 ? (
            <div style={{ gridColumn: '1/-1' }}>
              <EmptyState icon="🎯" title="No active challenges" message="Join or create a challenge to compete with others!" />
            </div>
          ) : (
            challenges.map(c => (
              <div key={c.id} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{c.type === 'STREAK' ? '🔥' : '📈'}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.participants.length} Participants</span>
                  <button onClick={() => joinChallenge(c.id)} className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>Join</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
