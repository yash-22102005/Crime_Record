import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  linkHref: string;
  linkText: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  linkHref,
  linkText,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
              <div className={cn("w-6 h-6", iconColor)}>{icon}</div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6 border-t">
        <div className="text-sm">
          <a
            href={linkHref}
            className="font-medium text-primary hover:text-primary-dark flex items-center"
          >
            {linkText}
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
        </div>
      </CardFooter>
    </Card>
  );
}
