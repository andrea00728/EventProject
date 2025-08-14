import React, { useState, useEffect, forwardRef } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Dropdown = forwardRef(({ show, setShow, icon, label, count, items, onItemClick, noScroll }, ref) => {
  const { darkMode } = useDarkMode();
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const itemsWithReadStatus = Array.isArray(items)
  ? items.map((item, index) => ({
      content: item,
      read: item.read !== undefined ? item.read : index % 2 === 0,
    }))
  : [];

  const filteredItems = filter === 'all'
    ? itemsWithReadStatus
    : itemsWithReadStatus.filter(item => !item.read);

  const unreadCount = itemsWithReadStatus.filter(item => !item.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShow(!show)}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}
        aria-label={label}
      >
        <div className="relative">
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </div>
      </button>

      {show && (
        <div
          className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] ${
            noScroll ? '' : 'overflow-y-auto'
          } rounded-xl shadow-xl border ${
            darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'
          } z-50 transition-all duration-200 ${isMobile ? 'left-4 right-4' : 'right-0'}`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              {React.cloneElement(icon, { className: 'w-5 h-5' })}
              <h4
                className={`font-semibold text-sm sm:text-base ${
                  darkMode ? 'text-purple-300' : 'text-purple-600'
                }`}
              >
                {label}
              </h4>
              {count > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tout ({items.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Non lus ({unreadCount})
              </button>
            </div>
          </div>
          <div className={`${noScroll ? '' : 'max-h-[60vh] overflow-y-auto'}`}>
            {filteredItems.length ? (
              filteredItems.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onItemClick && onItemClick(item.content)}
                  className={`p-3 transition-colors duration-150 border-b ${
                    darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                  } cursor-pointer ${!item.read ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold line-clamp-2 ${!item.read ? 'font-medium' : ''}`}
                      >
                        {item.content.title ||
                          (typeof item.content === 'object'
                            ? `${item.content.from}: ${item.content.text}`
                            : item.content)}
                      </p>
                      {item.content.message && (
                        <p className="text-sm line-clamp-2">{item.content.message}</p>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {item.content.date
                          ? format(new Date(item.content.date), 'dd MMM yyyy, HH:mm', { locale: fr })
                          : `Il y a ${Math.floor(Math.random() * 60)} min`}
                      </p>
                    </div>
                    {!item.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p
                  className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {filter === 'unread' ? `Aucun ${label.toLowerCase()} non lu` : `Aucun ${label.toLowerCase()}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default Dropdown;