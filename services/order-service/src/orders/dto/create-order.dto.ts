import { IsString, IsUUID, IsOptional, IsArray, ValidateNested, IsInt, IsNumber, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsUUID()
  venueId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
