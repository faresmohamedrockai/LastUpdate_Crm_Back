import { 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsEnum,
  IsArray,
  IsBoolean,
  IsDate 
} from 'class-validator';
import { Type } from 'class-transformer';
export enum LeadStatus {
  FRESH_LEAD = 'fresh_lead',
  FOLLOW_UP = 'follow_up',
  SCHEDULED_VISIT = 'scheduled_visit',
  OPEN_DEAL = 'open_deal',
  CANCELLATION = 'cancellation',
  CLOSED_DEAL = 'closed_deal',
  VIP = 'vip',
  NON_STOP = 'non_stop',
  NO_ANSWER = 'no_answer',
  NOT_INTERSTED_NOW = 'not_intersted_now',
  RESERVATION = 'reservation',
}

export enum Interest {
  HOT = 'hot',
  WARM = 'warm',
  UNDER_DECISION = 'under_decision',
}

export enum Tier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export class CreateLeadDto {

  @IsOptional()
  @IsString()
  familyName?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;
  @IsOptional()
  @IsString()
  otherProject?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) 
  contacts?: string[];

  @IsOptional()
  @IsString()
  email?: string;


  @IsOptional()
  @IsString()
  description?: string;





  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  budget?: number | string; 

  @IsOptional()
  @IsBoolean()
  cil?: boolean 


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[];

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsDate()
  lastCall?: Date;

  @IsOptional()
  @IsDate()
  lastVisit?: Date;

 @IsOptional()
  @Type(() => Date) // يحول من string لـ Date
  @IsDate()
  firstConection?: Date;




  
  @IsOptional()
  @IsString()
  inventoryInterestId?: string;

  @IsOptional()
  @IsString()
  projectInterestId?: string;


  @IsOptional()
  @IsString()
 contact?:string




  // ✅ Enums الجديدة
  @IsOptional()
  @IsEnum(Interest)
  interest?: Interest;

  @IsOptional()
  @IsEnum(Tier)
  tier?: Tier;
}
