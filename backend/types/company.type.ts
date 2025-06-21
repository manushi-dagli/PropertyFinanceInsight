import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export type CreateCompanyPayload = {
  companyName: string;
  emailAddress: string;
  companyAddress: string;
  contactNumber: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  contactPersonName: string;
};

export class CompanyCreateRequest {
  constructor(payload: CreateCompanyPayload) {
    this.companyName = payload.companyName;
    this.emailAddress = payload.emailAddress;
    this.companyAddress = payload.companyAddress;
  this.contactNumber = payload.contactNumber
    this.gstNumber = payload.gstNumber;
    this.panNumber = payload.panNumber;
    this.cinNumber = payload.cinNumber;
    this.contactPersonName = payload.contactPersonName;
  }

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsEmail()
  @IsOptional()
  emailAddress: string;

  @IsString()
  @IsOptional()
  companyAddress: string;

  @IsString()
  @IsOptional()
  contactNumber: string;

  @IsString()
  @IsOptional()
  gstNumber: string;

  @IsString()
  @IsOptional()
  panNumber: string;

  @IsString()
  @IsOptional()
  cinNumber: string;

  @IsString()
  @IsOptional()
  contactPersonName: string;
}

export interface UpdateCompanyPayload {
  companyName?: string;
  emailAddress?: string;
  companyAddress?: string;
  contactNumber?: string;
  gstNumber?: string;
  panNumber?: string;
  cinNumber?: string;
  contactPersonName?: string;
}
