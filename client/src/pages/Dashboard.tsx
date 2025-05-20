import { useEffect } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Activity, StatsData, ChartData } from "@/types";
import { ClipboardList, AlertTriangle, UserSearch, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  const { data: stats, isLoading: isLoadingStats } = useQuery<StatsData>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ["/api/dashboard/activities"],
  });

  const { data: chartData, isLoading: isLoadingCharts } = useQuery<ChartData>({
    queryKey: ["/api/dashboard/charts"],
  });

  // Format chart data for display
  const crimeTypeChartData = chartData?.crimeTypeDistribution
    ? chartData.crimeTypeDistribution.labels.map((label, index) => ({
        name: label,
        value: chartData.crimeTypeDistribution.data[index],
      }))
    : [];

  const crimeTrendsChartData = chartData?.monthlyCrimeTrends
    ? chartData.monthlyCrimeTrends.labels.map((label, index) => ({
        name: label,
        value: chartData.monthlyCrimeTrends.data[index],
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Overview of crime records and system activity.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Crimes"
          value={isLoadingStats ? "..." : stats?.totalCrimes || 0}
          icon={<ClipboardList className="text-primary-600" />}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
          linkHref="/crimes"
          linkText="View all"
        />

        <StatsCard
          title="Active Cases"
          value={isLoadingStats ? "..." : stats?.activeCases || 0}
          icon={<AlertTriangle className="text-amber-600" />}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          linkHref="/crimes?status=active"
          linkText="View all"
        />

        <StatsCard
          title="Criminal Records"
          value={isLoadingStats ? "..." : stats?.criminalRecords || 0}
          icon={<UserSearch className="text-red-600" />}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          linkHref="/criminals"
          linkText="View all"
        />

        <StatsCard
          title="FIR Reports"
          value={isLoadingStats ? "..." : stats?.firReports || 0}
          icon={<FileText className="text-green-600" />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          linkHref="/fir"
          linkText="View all"
        />
      </div>

      {/* Recent Activities */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activities</h3>
        <Card className="mt-2">
          {isLoadingActivities ? (
            <CardContent className="p-6">
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          ) : activities && activities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ul>
          ) : (
            <CardContent className="p-6">
              <p className="text-center text-gray-500">No recent activities found.</p>
            </CardContent>
          )}
          <CardFooter className="bg-gray-50 px-4 py-3 text-right">
            <a
              href="/activities"
              className="font-medium text-primary hover:text-primary-dark flex items-center justify-end"
              onClick={(e) => {
                e.preventDefault();
                setLocation("/activities");
              }}
            >
              View all activities
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </CardFooter>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ChartContainer
          title="Crime Type Distribution"
          type="pie"
          data={crimeTypeChartData}
          loading={isLoadingCharts}
        />

        <ChartContainer
          title="Monthly Crime Trends"
          type="line"
          data={crimeTrendsChartData}
          loading={isLoadingCharts}
        />
      </div>
    </div>
  );
}
