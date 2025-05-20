import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T | ((row: T) => React.ReactNode);
    cell?: (row: T) => React.ReactNode;
  }[];
  searchPlaceholder?: string;
  filterOptions?: {
    key: keyof T;
    label: string;
    options: { value: string; label: string }[];
  }[];
  onRowClick?: (row: T) => void;
  actionButtons?: (row: T) => React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search...",
  filterOptions,
  onRowClick,
  actionButtons,
  isLoading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search term
    if (searchTerm) {
      result = result.filter((item) => {
        return Object.keys(item).some((key) => {
          const value = item[key as keyof T];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = item[key as keyof T];
          if (typeof itemValue === "string") {
            return itemValue.toLowerCase() === value.toLowerCase();
          }
          return false;
        });
      }
    });

    return result;
  }, [data, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {filterOptions &&
          filterOptions.map((filter) => (
            <div key={filter.key.toString()} className="w-full md:w-48">
              <Select
                value={filters[filter.key.toString()] || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, [filter.key.toString()]: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}s</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
              {actionButtons && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actionButtons ? 1 : 0)} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actionButtons ? 1 : 0)} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell
                        ? column.cell(row)
                        : typeof column.accessorKey === "function"
                        ? column.accessorKey(row)
                        : String(row[column.accessorKey] || "")}
                    </TableCell>
                  ))}
                  {actionButtons && <TableCell className="text-right">{actionButtons(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>{" "}
              of <span className="font-medium">{filteredData.length}</span> results
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  onClick={() => handlePageClick(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
