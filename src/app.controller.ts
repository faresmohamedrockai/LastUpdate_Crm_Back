import { Controller, Get,UseGuards,Req  } from '@nestjs/common';
import { AppService } from './app.service';


@Controller("protect")
export class AppController {
  constructor(private readonly appService: AppService) {}

  




}
