import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdOutlineCalendarToday,
  MdVerifiedUser,
  MdAttachMoney,
  MdSearch,
} from "react-icons/md";

export default function Dashboard() {
  return (
    <div>
      <div>
        <h2 className="text-2xl  py-3 pl-3 text-start font-semibold">
          Tableau de bord
        </h2>
      </div>
      <div className="flex justify-center gap-3 py-5  flex-wrap">
        <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
          <h3 className="font-semibold mr-8">Nombre d'événements</h3>
          <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
            <span className="text-[20px]">20</span>
            <span className="text-[24px]">
              <MdCalendarToday />
            </span>
          </div>
        </div>
        <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
          <h3 className="font-semibold mr-8">Total des revenus</h3>
          <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
            <span className="text-[20px]">$ 17000</span>
            <span className="text-[24px]">
              <MdAttachMoney />
            </span>
          </div>
        </div>
        <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
          <h3 className="font-semibold mr-8">Total d'événements passées</h3>
          <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
            <span className="text-[20px]">20</span>
            <span className="text-[24px]">
              <MdOutlineCalendarMonth />
            </span>
          </div>
        </div>
        <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
          <h3 className="font-semibold mr-8">Total d'événements actifs</h3>
          <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
            <span className="text-[20px]">20</span>
            <span className="text-[24px]">
              <MdOutlineCalendarToday />
            </span>
          </div>
        </div>
        <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
          <h3 className="font-semibold mr-8">Total des organisateurs</h3>
          <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
            <span className="text-[20px]">20</span>
            <span className="text-[24px]">
              <FaUsers />
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-around flex-wrap gap-1 px-2 items-center py-6">
        <div>
          <h3 className="text-lg font-semibold text-start my-3">
            Prochaines événements
          </h3>
          <div className="bg-white shadow-2xl rounded-2xl p-4 overflow-y-auto h-[250px]">
            <table>
              <thead>
                <tr>
                  <th className="p-3 text-start">Nom</th>
                  <th className="p-3 text-start">Type</th>
                  <th className="p-3 text-start">Date</th>
                  <th className="p-3 text-start">Localisation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                  <td className="p-3 text-start">Mariage</td>
                  <td className="p-3 text-start">06/07/2025 06:00</td>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                </tr>
                <tr>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                  <td className="p-3 text-start">Mariage</td>
                  <td className="p-3 text-start">06/07/2025 06:00</td>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                </tr>
                <tr>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                  <td className="p-3 text-start">Mariage</td>
                  <td className="p-3 text-start">06/07/2025 06:00</td>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                </tr>
                <tr>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                  <td className="p-3 text-start">Mariage</td>
                  <td className="p-3 text-start">06/07/2025 06:00</td>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                </tr>
                <tr>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                  <td className="p-3 text-start">Mariage</td>
                  <td className="p-3 text-start">06/07/2025 06:00</td>
                  <td className="p-3 text-start">Mariage de Bu & Nu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-start my-3">
            Notifications
          </h3>
          <div className="bg-white shadow-2xl rounded-2xl px-6 py-8 overflow-y-auto h-[250px]">
            <span className=" hover:text-blue-600 transition duration-300 cursor-pointer m-2 block">
              <FaUser className="inline mr-2 mb-1" />
              Nouveau organisateur qui vient de s'inscrire
            </span>
            <span className=" hover:text-blue-600 transition duration-300 cursor-pointer m-2 block">
              <FaUser className="inline mr-2 mb-1" />
              Nouveau organisateur qui vient de s'inscrire
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}