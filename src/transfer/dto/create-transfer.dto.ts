import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransferDto {
    @IsOptional()
    @IsUUID()
    leadId: string;

    @IsUUID()
    @IsOptional()
    fromAgentId?: string;

    @IsUUID()
    @IsOptional()
    toAgentId?: string;

    @IsString()
    @IsOptional()
    transferType?: string;

    @IsString()
    @IsOptional()
    notes?: string;




}
