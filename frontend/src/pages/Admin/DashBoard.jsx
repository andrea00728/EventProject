import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { motion } from "framer-motion";

import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdVerifiedUser,
  MdAttachMoney,
} from "react-icons/md";

export default function Dashboard() {
  const stats = [
    {
      label: "Nombre d'événements",
      value: "20",
      icon: <MdCalendarToday />,
    },
    {
      label: "Total des revenus",
      value: "$17,000",
      icon: <MdAttachMoney />,
    },
    {
      label: "Événements passés",
      value: "20",
      icon: <MdOutlineCalendarMonth />,
    },
    {
      label: "Événements actifs",
      value: "20",
      icon: <MdCalendarToday />,
    },
    {
      label: "Organisateurs",
      value: "20",
      icon: <FaUsers />,
    },
  ];

  return (
    <div className="p-8 h-screen overflow-y-auto bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
      <div>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
          <MdDashboard className="mr-3" /> Tableau de bord
        </h2>
      </div>

      <div className="flex justify-center gap-5 flex-wrap py-5">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="pt-5 px-6 rounded-2xl bg-white shadow-xl transition duration-300 cursor-pointer"
          >
            <h3 className="font-semibold text-gray-700">{stat.label}</h3>
            <div className="flex justify-between items-center pt-8 pb-3">
              <span className="text-[22px] font-bold text-gray-800">
                {stat.value}
              </span>
              <span className="text-[26px] text-gray-500">{stat.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-around flex-wrap gap-4 px-2 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 min-w-[350px] max-w-[550px]"
        >
          <h3 className="text-xl font-semibold text-start mb-4">
            Prochains événements
          </h3>
          <div className="bg-white shadow-xl rounded-2xl p-4 overflow-y-auto h-[250px]">
            <table className="w-full">
              <thead>
                <tr className="text-gray-700">
                  <th className="p-3 text-start">Nom</th>
                  <th className="p-3 text-start">Type</th>
                  <th className="p-3 text-start">Date</th>
                  <th className="p-3 text-start">Localisation</th>
                </tr>
              </thead>
              <tbody>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 text-start">Mariage de Bu & Nu</td>
                      <td className="p-3 text-start">Mariage</td>
                      <td className="p-3 text-start">06/07/2025 06:00</td>
                      <td className="p-3 text-start">Antananarivo</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 min-w-[300px] max-w-[400px]"
        >
          <h3 className="text-xl font-semibold text-start mb-4">
            Notifications
          </h3>
          <div className="bg-white shadow-xl rounded-2xl p-4 overflow-y-auto h-[250px]">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <motion.span
                  whileHover={{ scale: 1.02, color: "#2563EB" }}
                  className="block my-2 text-gray-700 cursor-pointer transition duration-300"
                  key={i}
                >
                  <FaUser className="inline mr-2" />
                  Nouvel organisateur inscrit
                </motion.span>
              ))}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center flex-wrap gap-8 py-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-white rounded-2xl shadow-xl"
        >
          <EventChart />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-white rounded-2xl shadow-xl"
        >
          <MoneyChart />
        </motion.div>
      </div>
    </div>
  );
}

function EventChart() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-start my-3">Événements</h3>
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
      <h3 className="text-lg font-semibold text-start my-3">Paiements</h3>
      <LineChart
        height={280}
        series={[
          { data: pData, label: "PV" },
          { data: uData, label: "UV" },
        ]}
        xAxis={[{ scaleType: "point", data: xLabels }]}
        yAxis={[{ width: 50 }]}
        margin={margin}
        width={450}
      />
    </div>
  );
}
