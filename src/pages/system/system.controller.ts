import { Controller, Get } from '@nestjs/common'

@Controller()
export class SystemController {
    @Get()
    public test() {
        return 'hello,world'
    }
}
