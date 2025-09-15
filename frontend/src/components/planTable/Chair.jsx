// Composant Chaise : représente une chaise autour d'une table
function Chair({ number, style, isOccupied, guestName, onClick, isSelected, isMoving }) {
  return (
    <div
      className={`w-5 h-5 rounded-full absolute border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-all duration-200 ${isOccupied
        ? "bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600"
        : "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600"
      } ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''} ${isMoving ? 'ring-2 ring-yellow-400 ring-offset-1 animate-pulse' : ''}`}
      style={style} // Inclut transform: rotate(${rotation}deg)
      title={isOccupied ? `Place ${number} - ${guestName}` : `Place ${number} - Libre`}
      onClick={onClick}
    >
      {number}
    </div>
  );
}

export default Chair