import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { GiCook } from "react-icons/gi";
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdOutlineCalendarToday,
  MdVerifiedUser,
  MdAttachMoney,
  MdSearch,
} from "react-icons/md";

export default function PageCuisine() {
  return (
    <div className="p-8 h-screen overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-gray-200 pb-4 flex items-center">
            <GiCook className="mx-5 my-3 text-5xl" />
        </h2>
      </div>
      <div>
        <h2 className="text-2xl text-center font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-4 flex items-center">
          Mariage de Bu & Nu
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
      <div className="flex justify-center flex-wrap gap-5 items-start py-6">
        <div className="p-4">
          <EventChart />
        </div>
        <div className='p-4'>
          <MoneyChart />
        </div>
      </div>
    </div>
  );
}

function EventChart() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-start my-3">Événements</h3>
      <div className="bg-white shadow-2xl rounded-2xl p-4">
        <BarChart
          series={[
            { data: [35, 44, 24, 34] },
            { data: [51, 6, 49, 30] },
            { data: [15, 25, 30, 50] },
            { data: [60, 50, 15, 25] },
          ]}
          height={290}
          width={450}
          xAxis={[{ data: ["Q1", "Q2", "Q3", "Q4"] }]}
        />
      </div>
    </div>
  );
}

function MoneyChart() {
  const margin = { right: 24 };
  const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
  const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
  const xLabels = [
    "Page A",
    "Page B",
    "Page C",
    "Page D",
    "Page E",
    "Page F",
    "Page G",
  ];
  return (
    <div>
      <h3 className="text-lg font-semibold text-start my-3">Payements</h3>
      <div className="bg-white shadow-2xl rounded-2xl p-4">
        <LineChart
          height={280}
          series={[
            { data: pData, label: "pv" },
            { data: uData, label: "uv" },
          ]}
          xAxis={[{ scaleType: "point", data: xLabels }]}
          yAxis={[{ width: 50 }]}
          margin={margin}
          width={450}
        />
      </div>
    </div>
  );
}
