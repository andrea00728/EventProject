import React, { useRef } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";

const Modalist = ({ show, onClose, title, items, onItemClick, onDelete }) => {
  const { darkMode } = useDarkMode();
  const modalRef = useRef(null);

  if (!show) {
    return null;
  }

  const handleItemClick = (item) => {
    onItemClick && onItemClick(item);
  };

  const handleDelete = (item) => {
    onDelete && onDelete(item.id);
  };

  const itemsWithReadStatus = Array.isArray(items)
    ? items.map((item) => ({
        content: item,
        read: item.read !== undefined ? item.read : false,
      }))
    : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl transition-all transform duration-300 ${
          darkMode
            ? "bg-gray-800 text-gray-200 border border-gray-700"
            : "bg-white text-gray-900 border border-gray-200"
        } scale-100 opacity-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors duration-200 ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2 overflow-y-auto max-h-[calc(90vh-80px)]">
          {itemsWithReadStatus.length > 0 ? (
            itemsWithReadStatus.map((item, i) => (
              <div
                key={i}
                onClick={() => handleItemClick(item.content)}
                className={`p-3 transition-colors duration-150 border-b ${
                  darkMode
                    ? "border-gray-700 hover:bg-gray-700"
                    : "border-gray-200 hover:bg-gray-50"
                } cursor-pointer ${
                  !item.read ? (darkMode ? "bg-blue-900/20" : "bg-blue-50") : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold line-clamp-2 ${
                        !item.read ? "font-medium" : ""
                      }`}
                    >
                      {item.content.title ||
                        (typeof item.content === "object"
                          ? `${item.content.from || item.content.firstName} : `
                          : item.content)}
                    </p>
                    {item.content.message && (
                      <p className="text-sm line-clamp-2">
                        {item.content.message}
                      </p>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {item.content.date
                        ? format(new Date(item.content.date), "dd MMM yyyy, HH:mm", {
                            locale: fr,
                          })
                        : format(
                            new Date(item.content.createdAt),
                            "dd/MM/yyyy, HH:mm:ss",
                            { locale: fr }
                          )}
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-2 mt-1 gap-2">
                    {!item.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.content);
                      }}
                      className={`p-1 rounded-full ${
                        darkMode
                          ? "text-gray-400 hover:bg-gray-600"
                          : "text-gray-500 hover:bg-gray-200"
                      } transition-colors duration-150`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.381 21H7.618a2 2 0 01-1.99-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center">
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Aucun élément à afficher.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modalist;