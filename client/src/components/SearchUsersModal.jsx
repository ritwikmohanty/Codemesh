import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Jdenticon rendering utility
const renderJdenticon = (element, value) => {
  if (!element || !window.jdenticon) return;
  
  try {
    // Jdenticon automatically renders to the element if it has data-jdenticon-value
    window.jdenticon.update(element, value);
  } catch (err) {
    console.error('Jdenticon render error:', err);
  }
};

const SearchUsersModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const svgRefs = useRef({});

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/users/search`, {
          params: { q: searchQuery },
          withCredentials: true
        });

        setSearchResults(response.data.data || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search users');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Render jdenticons after results update
  useEffect(() => {
    searchResults.forEach((user) => {
      if (!user.avatarUrl && svgRefs.current[user._id]) {
        renderJdenticon(svgRefs.current[user._id], user.username || user.email);
      }
    });
  }, [searchResults]);

  // Handle keyboard shortcuts (ESC and Ctrl+K)
  useEffect(() => {
    const handleKeydown = (e) => {
      // ESC to close
      if (e.key === 'Escape') {
        handleClose();
      }
      // Ctrl+K or Cmd+K to toggle
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // Match animation duration
  };

  const handleUserClick = (username) => {
    navigate(`/portfolio/${username}`);
    handleClose();
    setSearchQuery('');
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 backdrop-blur-sm bg-black/50 transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-labelledby="search-dialog-title"
        className={`fixed top-4 md:top-[calc(50%-250px)] z-50 w-[calc(100%-2em)] left-0 right-0 mx-auto max-w-screen-sm rounded-xl border bg-popover text-popover-foreground shadow-2xl shadow-black/50 overflow-hidden transition-all duration-300 ${
          isClosing 
            ? 'opacity-0 scale-95' 
            : 'opacity-100 scale-100 animate-bounce-in'
        }`}
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="search-dialog-title" className="sr-only">
          Search Users
        </h2>

        {/* Search Input */}
        <div className="flex flex-row items-center gap-2 p-3 border-b">
          <Search className="size-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search users by username..."
            className="w-0 flex-1 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md p-2 font-medium transition-colors duration-100 hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring gap-1 px-2 py-1.5 text-xs font-mono text-muted-foreground border"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            searchQuery.trim() && (searchResults.length > 0 || isLoading || error)
              ? 'max-h-[460px]'
              : 'max-h-0'
          }`}
        >
          <div className="w-full flex-col overflow-y-auto max-h-[460px] p-1">
            {isLoading && (
              <div className="p-4 text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && searchQuery.trim() && searchResults.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No users found matching "{searchQuery}"
              </div>
            )}

            {!isLoading && !error && searchResults.length > 0 && (
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserClick(user.username)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    {/* Avatar with jdenticon */}
                    <div className="relative flex-shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <svg
                          ref={(el) => {
                            if (el) {
                              svgRefs.current[user._id] = el;
                              renderJdenticon(el, user.username || user.email);
                            }
                          }}
                          width="40"
                          height="40"
                          data-jdenticon-value={user.username || user.email}
                          className="rounded-full"
                        />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </div>
                    </div>

                    {/* Badge or additional info */}
                    {user.onboardingCompleted && (
                      <div className="flex-shrink-0">
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Active
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        {!searchQuery.trim() && (
          <div className="bg-secondary/50 p-3 text-xs text-muted-foreground text-center border-t flex items-center justify-center gap-2">
            Start typing to search for users...
            <span className="ml-2 flex items-center gap-1 text-xs opacity-70">
              <kbd className="px-2 py-1 bg-background border border-border rounded text-foreground">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-background border border-border rounded text-foreground">K</kbd>
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchUsersModal;
