import {
    Activity,
    RefreshCw,
    TrendingUp,
    Users,
} from "lucide-react";
import { SystemStatistics } from "../../models/Statistics";

interface StatisticsDisplayProps {
  statistics: SystemStatistics;
}

export default function StatisticsDisplay({ statistics }: StatisticsDisplayProps) {
  const statCards = [
    {
      title: "Total Users",
      value: statistics.users.totalUsers,
      icon: Users,
      color: "bg-[#9b88c7]",
    },
    {
      title: "Daily Active",
      value: statistics.users.dailyActiveUsers,
      icon: TrendingUp,
      color: "bg-[#63d079]",
    },
    {
      title: "Weekly Active",
      value: statistics.users.weeklyActiveUsers,
      icon: TrendingUp,
      color: "bg-[#40a8d0]",
    },
    {
      title: "Monthly Active",
      value: statistics.users.monthlyActiveUsers,
      icon: TrendingUp,
      color: "bg-[#f3d99c]",
    },
  ];

  const syncCards = [
    {
      title: "Sync Groups",
      value: statistics.syncs.totalSyncGroups,
      icon: RefreshCw,
      color: "bg-[#9b88c7]",
    },
    {
      title: "Active Groups",
      value: statistics.syncs.activeSyncGroups,
      icon: RefreshCw,
      color: "bg-[#63d079]",
    },
    {
      title: "Syncs Today",
      value: statistics.syncs.syncsToday,
      icon: RefreshCw,
      color: "bg-[#f3d99c]",
    },
    {
      title: "Syncs This Month",
      value: statistics.syncs.syncsThisMonth,
      icon: RefreshCw,
      color: "bg-[#40a8d0]",
    },
  ];

  const auditCards = [
    {
      title: "Total Actions",
      value: statistics.audits.totalActions,
      icon: Activity,
      color: "bg-[#e0b39c]",
    },
    {
      title: "Actions Today",
      value: statistics.audits.actionsToday,
      icon: Activity,
      color: "bg-[#63d079]",
    },
    {
      title: "Actions This Week",
      value: statistics.audits.actionsThisWeek,
      icon: Activity,
      color: "bg-[#40a8d0]",
    },
    {
      title: "Actions This Month",
      value: statistics.audits.actionsThisMonth,
      icon: Activity,
      color: "bg-[#f3d99c]",
    },
  ];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white border-2 border-black box-style-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase text-gray-600 mb-1 truncate">{title}</div>
          <div className="text-3xl font-black">{value.toLocaleString()}</div>
        </div>
        <div className={`${color} p-3 border-2 border-black rounded-lg box-style-sm flex-shrink-0 ml-2`}>
          <Icon className="w-5 h-5 text-black" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* User Statistics */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5" />
          Users
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      {/* Sync & Audit Statistics - Combined */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 text-gray-700">
            <RefreshCw className="w-5 h-5" />
            Sync
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {syncCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 text-gray-700">
            <Activity className="w-5 h-5" />
            Audit
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {auditCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>

      {/* Actions by Type */}
      <div className="bg-white border-2 border-black box-style-md p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-gray-700">
          Actions by Type
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(statistics.audits.actionsByType).map(([type, count]) => (
            <div key={type} className="border-2 border-gray-300 p-3 rounded box-style-sm">
              <div className="text-xs text-gray-600 mb-1 truncate">{type}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

