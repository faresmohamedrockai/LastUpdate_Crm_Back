// src/calls/dto/create-call.dto.ts
import { IsUUID, IsString, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateCallDto {
 @IsOptional()
 @IsString()
  leadId: string;




 @IsOptional()
 @IsString()
date: string;


  @IsString()
  outcome: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  project?: string;
  
  // ✅ اسم الحقل يجب أن يكون مطابقاً للنموذج في Prisma
 @IsOptional()
  @IsString()
  createdBy: string; // ✅ أضفنا createdBy كما في الواجهة CallLog
}
