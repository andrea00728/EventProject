import React, { forwardRef, useState, useEffect, useMemo } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";

const Dropdown = forwardRef(
  (
    { icon, label, count, items, show, setShow, onItemClick, onDelete, onViewMore, noScroll },
    ref
  ) => {
    const { darkMode } = useDarkMode();
    const dropdownRef = ref;
    const [isMobile, setIsMobile] = useState(false);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const itemsWithReadStatus = useMemo(
      () => items.map(item => ({ content: item, read: !!item.read })),
      [items]
    );

    const filteredItems = useMemo(() => {
      if (filter === "all") return itemsWithReadStatus;
      if (filter === "unread") return itemsWithReadStatus.filter(item => !item.read);
      if (filter === "read") return itemsWithReadStatus.filter(item => item.read);
    }, [filter, itemsWithReadStatus]);

    const unreadCount = itemsWithReadStatus.filter(item => !item.read).length;

    const toggleDropdown = () => setShow(!show);

    const handleItemClick = (item) => {
      if (onItemClick) onItemClick(item);
      setShow(false);
    };

    const handleDelete = (e, item) => {
      e.stopPropagation();
      if (onDelete) onDelete(item.id);
    };

    const handleViewMoreClick = (e) => {
      e.preventDefault();
      setShow(false);
      if (onViewMore) onViewMore();
    };

    const viewMoreButtonText =
      label === "Messages" ? "Voir tous les messages" : `Voir toutes les ${label.toLowerCase()}`;

    return (
      <div ref={dropdownRef} className="relative" role="menu">
        <button
          onClick={toggleDropdown}
          className={`relative p-2 rounded-full transition-colors duration-200 ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
          aria-label={label}
        >
          {icon}
          {count > 0 && (
            <span
              className={`absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full text-white transform translate-x-1 -translate-y-1 transition-transform duration-300 ${
                darkMode ? "bg-red-500" : "bg-red-600"
              }`}
            >
              {count > 9 ? "+9" : count}
            </span>
          )}
        </button>

        {show && (
          <div
            className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] ${
              noScroll ? "" : "overflow-y-auto"
            } rounded-xl shadow-xl border ${
              darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-900"
            } z-50 transition-all duration-200 ${isMobile ? "left-4 right-4 top-16" : "right-0"}`}
          >
            {/* Header & Filters */}
            <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold">{label}</h3>
                {count > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {["all", "unread", "read"].map(f => {
                  const labelText =
                    f === "all"
                      ? `Tout (${items.length})`
                      : f === "unread"
                      ? `Non lus (${unreadCount})`
                      : `Lus (${itemsWithReadStatus.filter(i => i.read).length})`;

                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        active
                          ? "bg-blue-500 text-white"
                          : darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {labelText}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            {filteredItems.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {filteredItems.map((item) => {
                  const dateValue = item.content.date || item.content.createdAt;
                  const dateObject = new Date(dateValue);
                  const isValidDate = !isNaN(dateObject.getTime());

                  return (
                    <div
                      key={item.content.id || item.content._id || Math.random()}
                      onClick={() => handleItemClick(item.content)}
                      className={`flex items-center p-3 transition-colors duration-150 border-b ${
                        darkMode
                          ? "border-gray-700 hover:bg-gray-700"
                          : "border-gray-200 hover:bg-gray-50"
                      } cursor-pointer relative ${
                        !item.read ? (darkMode ? "bg-blue-900/20" : "bg-blue-50") : ""
                      }`}
                      role="menuitem"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          !item.read ? "bg-blue-500" : ""
                        }`}
                      />
                      <div className="flex-1 truncate">
                        <p className={`text-sm ${!item.read ? "font-semibold" : "font-medium"}`}>
                          {item.content.title || `${item.content.from}`}
                        </p>
                        <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {item.content.message || item.content.text}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {isValidDate ? format(dateObject, "dd MMM, HH:mm", { locale: fr }) : "Date inconnue"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, item.content)}
                        className={`p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors duration-150 ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {filter === "unread"
                  ? `Aucun ${label.toLowerCase()} non lu.`
                  : `Aucun ${label.toLowerCase()} à afficher.`}
              </div>
            )}

            {/* View More */}
            {onViewMore && items.length > 0 && (
              <div className={`p-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  onClick={handleViewMoreClick}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  {viewMoreButtonText}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default Dropdown;