// create-meeting.dto.ts
import {
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';
import { IsFutureDateIfScheduled } from '../dto/checkScheduale';

export class CreateMeetingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsDateString()
  @IsFutureDateIfScheduled('status', {
    message: 'التاريخ لا يمكن أن يكون في الماضي إذا كانت الحالة Scheduled',
  })
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Scheduled', 'Completed', 'Cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  objections?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  inventoryId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  locationType?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
