import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealthCheckController {
  constructor(
  ) { }

  @Get('/')
  helloWorld() {
    return {
      message: 'ok!'
    }
  }
}
