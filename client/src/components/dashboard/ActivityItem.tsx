import { cn, getRelativeTime } from "@/lib/utils";
import { Activity } from "@/types";

interface ActivityItemProps {
  activity: Activity;
}

function getStatusBadgeClass(type: string) {
  switch (type) {
    case 'new':
      return 'bg-green-100 text-green-800';
    case 'updated':
      return 'bg-yellow-100 text-yellow-800';
    case 'progress':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { description, type, location, officer, timestamp } = activity;
  const badgeClass = getStatusBadgeClass(type);

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-primary truncate">{description}</p>
        <div className="ml-2 flex-shrink-0 flex">
          <p className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", badgeClass)}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </p>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </p>
          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {officer}
          </p>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            {getRelativeTime(timestamp)}
          </p>
        </div>
      </div>
    </li>
  );
}
