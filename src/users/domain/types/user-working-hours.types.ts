export type CreateUserWorkingHoursProps = {
  id?: string;
  userId: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  isDayOff?: boolean;
};

export type UserWorkingHoursProps = {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isDayOff: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type UserWorkingHoursSnapshot = {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isDayOff: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ChangeUserWorkingHoursProps = {
  startTime?: string;
  endTime?: string;
  isDayOff?: boolean;
};
