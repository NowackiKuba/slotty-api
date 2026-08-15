export type UserWorkingHoursReadModel = {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isDayOff: boolean;
  createdAt: Date;
  updatedAt: Date;
};
