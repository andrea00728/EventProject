import React, { forwardRef } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";

const Dropdown = forwardRef(
  ({ icon, label, count, items, show, setShow, onItemClick, onDelete, onViewMore }, ref) => {
    const { darkMode } = useDarkMode();
    const dropdownRef = ref;

    const toggleDropdown = () => {
      setShow(!show);
    };

    const handleItemClick = (item) => {
      if (onItemClick) {
        onItemClick(item);
      }
      setShow(false);
    };

    const handleDelete = (e, item) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete(item.id);
      }
    };

    const displayedItems = items.slice(0, 5);

    const handleViewMoreClick = (e) => {
        e.preventDefault();
        setShow(false);
        if (onViewMore) {
            onViewMore();
        }
    };

    return (
      <div ref={dropdownRef} className="relative">
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
            className={`absolute top-full right-0 mt-2 w-72 rounded-lg shadow-xl border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } z-50 transition-all duration-300 transform origin-top-right`}
          >
            <div className={`py-2 px-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className="font-semibold">{label}</h3>
            </div>
            {displayedItems.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {displayedItems.map((item, index) => {
                  const dateValue = item.date || item.createdAt;
                  const dateObject = new Date(dateValue);
                  const isValidDate = !isNaN(dateObject.getTime());

                  return (
                    <div
                      key={index}
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center p-3 transition-colors duration-150 border-b ${
                        darkMode
                          ? "border-gray-700 hover:bg-gray-700"
                          : "border-gray-200 hover:bg-gray-50"
                      } cursor-pointer relative`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          !item.read ? "bg-blue-500" : ""
                        }`}
                      ></div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium">
                          {item.title || `${item.from || item.firstName} ${item.lastName}`}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {item.message || item.text}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {isValidDate
                            ? format(dateObject, "dd MMM, HH:mm", { locale: fr })
                            : "Date inconnue"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, item)}
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
                Aucun élément à afficher.
              </div>
            )}
            
            {items.length > 5 && (
              <div className={`p-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  onClick={handleViewMoreClick}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  Voir plus ({items.length - displayedItems.length} nouveaux)
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