import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { ScheduleResponse } from "@shared/schema";

export function EstimatedSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAll, setShowAll] = useState(false);

  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date(selectedDate);
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - currentDay + (currentDay === 0 ? -6 : 1),
    );

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  const {
    data: scheduleData,
    isLoading,
    error,
  } = useQuery<ScheduleResponse>({
    queryKey: ["/api/schedule", selectedDateStr],
  });

  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      fullDate: date.toISOString().split("T")[0],
    };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
    setShowAll(false);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
    setShowAll(false);
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return "TBA";
    return time; // Already in 24-hour format from API
  };

  const getCurrentTimezone = () => {
    const offset = -(new Date().getTimezoneOffset() / 60);
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset).toString().padStart(2, "0");
    const minutes = ((absOffset % 1) * 60).toString().padStart(2, "0");
    return `GMT ${sign}${hours}:${minutes}`;
  };

  // Extract scheduledAnimes from the response
  const scheduledAnimes = scheduleData?.data?.scheduledAnimes || [];

  const displayedAnimes = showAll
    ? scheduledAnimes
    : scheduledAnimes.slice(0, 8);
  const hasMore = scheduledAnimes.length > 8;

  return (
    <div className="w-full bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20 shadow-lg text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Estimated Schedule
        </h1>
        <div className="text-gray-400 text-xs sm:text-sm font-mono">
          ({getCurrentTimezone()}){" "}
          {selectedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}{" "}
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <button
          onClick={goToPreviousWeek}
          className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#2a1a4a] hover:bg-[#3a2a5a] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
          {weekDates.map((date, idx) => {
            const { day, date: dayNum, month } = formatDate(date);
            const selected = isSameDay(date, selectedDate);

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(new Date(date));
                  setShowAll(false);
                }}
                className={`flex flex-col items-center justify-center py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  selected
                    ? "bg-[#610c93] text-white"
                    : "bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a3e]"
                }`}
                data-testid={`button-day-${day.toLowerCase()}`}
              >
                <span className="text-[10px] sm:text-xs lg:text-sm font-semibold">
                  {day}
                </span>
                <span className="text-[8px] sm:text-[10px] lg:text-xs mt-0.5 sm:mt-1">
                  <span className="hidden sm:inline">{month} </span>
                  {dayNum}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={goToNextWeek}
          className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#2a1a4a] hover:bg-[#3a2a5a] rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Schedule List */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {isLoading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-700 border-r-transparent"></div>
            <p className="text-gray-400 mt-4 text-sm">Loading schedule...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-red-400 text-base sm:text-lg">
              Error loading schedule
            </p>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">
              {(error as Error).message}
            </p>
          </div>
        ) : scheduledAnimes && scheduledAnimes.length > 0 ? (
          <>
            <div className="space-y-0">
              {displayedAnimes.map((item: any, idx: number) => (
                <Link key={idx} href={`/anime/${item.id}`}>
                  <div
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-4 sm:py-6 border-b border-gray-800 hover:bg-[#0a0a0a] px-3 sm:px-4 -mx-3 sm:-mx-4 transition-colors cursor-pointer"
                    data-testid={`card-schedule-${item.id}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
                      <span className="text-sm sm:text-base lg:text-lg font-medium text-purple-400 w-12 sm:w-16 flex-shrink-0">
                        {formatTime(item.time)}
                      </span>
                      <h3
                        className="text-sm sm:text-base lg:text-lg text-white flex-1 line-clamp-2 sm:truncate"
                        data-testid={`text-schedule-title-${item.id}`}
                      >
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 ml-14 sm:ml-0">
                      {item.episode && (
                        <span className="text-xs sm:text-sm text-gray-400 bg-[#1a1a2e] px-2 py-1 rounded">
                          ▶ EP {item.episode}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full mt-6 py-3 sm:py-4 bg-[#2a1a4a] hover:bg-[#3a2a5a] text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
              >
                Show More ({scheduledAnimes.length - 8} more)
              </button>
            )}

            {showAll && hasMore && (
              <button
                onClick={() => setShowAll(false)}
                className="w-full mt-6 py-3 sm:py-4 bg-[#2a1a4a] hover:bg-[#3a2a5a] text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
              >
                Show Less
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <p className="text-gray-400 text-base sm:text-lg">
              No anime scheduled for this day
            </p>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">
              Select another date to see upcoming releases
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
