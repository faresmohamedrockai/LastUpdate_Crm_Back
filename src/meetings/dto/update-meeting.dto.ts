import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { IsFutureDateIfScheduled } from '../dto/checkScheduale';
export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  client?: string;


  @IsOptional()
  @IsString()
  leadId?: string;


  @IsOptional()
  @IsDateString()
  @IsFutureDateIfScheduled('status')
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsBoolean()
  meetingDone?: boolean;


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
  assignedToId?: string;
}
